using System.Text;
using System.Linq;
using backend.Data;
using backend.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Hubs;
using backend.Middleware;
using backend.Validation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables (for local dev)
Env.Load();

// Support multiple domains + auto-trim trailing slashes (which often breaks CORS)
// 1. Get from Env (safely handle null/empty)
var envUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
var origins = new List<string>();

if (!string.IsNullOrWhiteSpace(envUrl))
{
    origins.AddRange(envUrl.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
}

// 2. ALWAYS add the known production Vercel URL (Hardcoded Safety Net)
origins.Add("https://veiling-ai-web-applicatie-real-not.vercel.app");
origins.Add("http://localhost:3000"); // Localhost fallback

// 3. Normalize: Trim slashes & remove duplicates
var frontendOrigins = origins
    .Where(o => !string.IsNullOrWhiteSpace(o))
    .Select(o => o.TrimEnd('/'))
    .Distinct()
    .ToArray();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-secret-change-me";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "VeilingAI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "VeilingAIUsers";
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

// CORS - Must be specific origins to allow Credentials (Cookies)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(frontendOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

Console.WriteLine($"[DEBUG] FRONTEND_URL Env: {Environment.GetEnvironmentVariable("FRONTEND_URL")}");
Console.WriteLine($"[DEBUG] Final Allowed Origins: {string.Join(", ", frontendOrigins)}");

// add controllers, dbcontext, swagger, authentication, authorization, password hasher
builder.Services.AddControllers()
    .AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<ProductGegevensValidator>());

builder.Services.AddHealthChecks();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddSingleton<AuctionRealtimeService>();
builder.Services.AddScoped<PrijsHistorieService>();
builder.Services.AddSignalR();
builder.Services.AddResponseCompression(options =>
{
    // Enable compression for SignalR JSON payloads to shave latency/bandwidth.
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] { "application/octet-stream" });
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        // Read access token from HttpOnly cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("access_token", out var accessToken) &&
                    !string.IsNullOrWhiteSpace(accessToken))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// Since we're in Docker behind Apache, we need to be aggressive about trusting headers
// or SameSite=None cookies will be rejected because .NET thinks it's on HTTP.
// (Already handled in Program.cs earlier, but let's ensure it's not restricted)
// Actually, let's add the fix directly here to be sure:
app.Use(async (context, next) =>
{
    if (context.Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto))
    {
        context.Request.Scheme = proto;
    }
    await next();
});

app.UseMiddleware<GlobalExceptionMiddleware>(); // Global Error Handling (Top Priority)

app.UseSwagger();
app.UseSwaggerUI();

app.UseResponseCompression();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowFrontend");

app.MapHealthChecks("/health"); // Health Check Endpoint

// double-submit CSRF check for state-changing requests
app.Use(async (context, next) =>
{
    var referer = context.Request.Headers.Referer.ToString();
    if (context.Request.Path.StartsWithSegments("/hubs") ||
        context.Request.Path.StartsWithSegments("/swagger") ||
        (!string.IsNullOrWhiteSpace(referer) &&
         referer.Contains("/swagger", StringComparison.OrdinalIgnoreCase)))
    {
        await next();
        return;
    }

    if (HttpMethods.IsPost(context.Request.Method) ||
        HttpMethods.IsPut(context.Request.Method) ||
        HttpMethods.IsDelete(context.Request.Method) ||
        HttpMethods.IsPatch(context.Request.Method))
    {
        if (context.Request.Cookies.TryGetValue("access_token", out _) &&
            (!context.Request.Headers.TryGetValue("X-XSRF-TOKEN", out var headerToken) ||
             !context.Request.Cookies.TryGetValue("XSRF-TOKEN", out var cookieToken) ||
             !string.Equals(headerToken, cookieToken, StringComparison.Ordinal)))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Invalid CSRF token.");
            return;
        }
    }

    await next();
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<AuctionHub>("/hubs/auction");

// Admin user!!
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    
    // Automatically apply any pending migrations on startup
    context.Database.Migrate();
    
    var passwordHasher = services.GetRequiredService<PasswordHasher>();

    const string adminEmail = "admin@example.com";
    const string adminPassword = "baller123456";

    if (!context.Gebruikers.Any(g => g.Emailadres == adminEmail))
    {
        context.Gebruikers.Add(new backend.Models.Gebruiker
        {
            Emailadres = adminEmail,
            Wachtwoord = passwordHasher.Hash(adminPassword),
            Naam = "Admin",
            Role = "ADMIN"
        });

        context.SaveChanges();
    }

    // Seed Locaties
    if (!context.Locaties.Any())
    {
        context.Locaties.AddRange(new List<backend.Models.Locatie>
        {
            new backend.Models.Locatie { LocatieNaam = "Aalsmeer", Foto = "https://images.unsplash.com/photo-1591880911020-f3a197c416c7?q=80&w=400" },
            new backend.Models.Locatie { LocatieNaam = "Naaldwijk", Foto = "https://images.unsplash.com/photo-1582794541440-3497a9211639?q=80&w=400" },
            new backend.Models.Locatie { LocatieNaam = "Rijnsburg", Foto = "https://images.unsplash.com/photo-1596438459194-f275f413d6ff?q=80&w=400" },
            new backend.Models.Locatie { LocatieNaam = "Eelde", Foto = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=400" },
            new backend.Models.Locatie { LocatieNaam = "Venlo", Foto = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=400" },
            new backend.Models.Locatie { LocatieNaam = "Ede (Plantion)", Foto = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=400" },
            new backend.Models.Locatie { LocatieNaam = "Straelen-Herongen", Foto = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=400" }
        });
        context.SaveChanges();
    }

    // Seed Products
    if (!context.ProductGegevens.Any())
    {
        context.ProductGegevens.AddRange(new List<backend.Models.ProductGegevens>
        {
            new backend.Models.ProductGegevens 
            { 
                ProductNaam = "Moederdag Rozen", 
                ProductBeschrijving = "Een prachtige bos rode rozen, perfect voor Moederdag.",
                Fotos = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=300",
                Hoeveelheid = 100,
                StartPrijs = 12.50m,
                EindPrijs = 5.0m,
                Huidigeprijs = 12.50m,
                VerkoperId = 1,
                LocatieId = 1, // Aalsmeer
                VeilingId = 1
            },
            new backend.Models.ProductGegevens 
            { 
                ProductNaam = "Lentestruik Mix", 
                ProductBeschrijving = "Mix van tulpen en narcissen.",
                Fotos = "https://images.unsplash.com/photo-1588691512224-ca87d46c825a?q=80&w=300",
                Hoeveelheid = 50,
                StartPrijs = 15.00m,
                EindPrijs = 7.50m,
                Huidigeprijs = 15.00m,
                VerkoperId = 1,
                LocatieId = 2, // Naaldwijk
                VeilingId = 1
            }
        });
        context.SaveChanges();
    }

    // Seed Veiling
    if (!context.Veiling.Any())
    {
        context.Veiling.Add(new backend.Models.Veiling
        {
            Naam = "Ochtendveiling Aalsmeer",
            Beschrijving = "De dagelijkse ochtendveiling voor bloemen in Aalsmeer.",
            Image = "https://images.unsplash.com/photo-1591880911020-f3a197c416c7?q=80&w=800",
            Starttijd = DateTimeOffset.UtcNow.AddHours(1),
            Eindtijd = DateTimeOffset.UtcNow.AddHours(5),
            VeilingMeesterId = 1,
            LocatieId = 1
        });
        context.SaveChanges();
    }
}

app.Run();
