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
using FluentValidation;
using backend.Validation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;

// Load environment variables (for local dev)
Env.Load();

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(frontendOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("X-XSRF-TOKEN");
    });
});

builder.Services.AddControllers();
// Updated FluentValidation registration (deprecated method removed)
builder.Services.AddValidatorsFromAssemblyContaining<ProductCreateValidator>();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

builder.Services.AddHealthChecks();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{ 
        var xmlFilename = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddSingleton<AuctionRealtimeService>();
builder.Services.AddSingleton<AuctionStarterService>();
builder.Services.AddHostedService<AuctionStarterService>(sp => sp.GetRequiredService<AuctionStarterService>()); // Auto-start auctions when startTijd is reached
builder.Services.AddScoped<PrijsHistorieService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IFileService, LocalFileService>();
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
        context.Request.Path.Equals(new PathString("/api/Gebruiker/login"), StringComparison.OrdinalIgnoreCase) ||
        context.Request.Path.Equals(new PathString("/api/Gebruiker/register"), StringComparison.OrdinalIgnoreCase) ||
        context.Request.Path.Equals(new PathString("/api/Gebruiker/logout"), StringComparison.OrdinalIgnoreCase) ||
        context.Request.Path.Equals(new PathString("/api/Gebruiker/refresh"), StringComparison.OrdinalIgnoreCase) ||
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
    var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "baller123456";

    var adminUser = context.Gebruikers.FirstOrDefault(g => g.Emailadres == adminEmail);

    if (adminUser == null)
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
    else
    {
        // Check if the password in the DB matches the one in ENV. If not, update it.
        // passworHasher.Verify(input, hash) returns true if match.
        if (!passwordHasher.Verify(adminPassword, adminUser.Wachtwoord))
        {
            Console.WriteLine("[INFO] Updating Admin password from environment variable...");
            adminUser.Wachtwoord = passwordHasher.Hash(adminPassword);
            context.SaveChanges();
        }
    }


}

app.Run();
