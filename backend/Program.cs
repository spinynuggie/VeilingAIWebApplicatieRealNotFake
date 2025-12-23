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

var builder = WebApplication.CreateBuilder(args);

Env.Load();
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
var frontendUrlAlt = Environment.GetEnvironmentVariable("FRONTEND_URL_ALT") ?? "http://127.0.0.1:3000";
var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-secret-change-me";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "VeilingAI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "VeilingAIUsers";
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(frontendUrl, frontendUrlAlt) // your frontend origins
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// add controllers, dbcontext, swagger, authentication, authorization, password hasher
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddSingleton<AuctionRealtimeService>();
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

app.UseSwagger();
app.UseSwaggerUI();

app.UseResponseCompression();
app.UseRouting();
app.UseCors("AllowFrontend");

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
}

app.Run();
