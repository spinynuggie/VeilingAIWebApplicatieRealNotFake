using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

Env.Load();
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
var frontendUrlAlt = Environment.GetEnvironmentVariable("FRONTEND_URL_ALT") ?? "http://127.0.0.1:3000";
// --- Add CORS ---
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

// --- Add controllers, DB context, etc. ---
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<PasswordHasher>();

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.SlidingExpiration = true;
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// --- Use middleware ---
app.UseSwagger();
app.UseSwaggerUI();

// ✅ Enable CORS before authorization and mapping controllers
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed an admin user for demo purposes
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
