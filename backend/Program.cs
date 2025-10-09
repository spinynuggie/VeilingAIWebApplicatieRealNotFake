using System.Data;
using Dapper;
using MySqlConnector;
using Microsoft.AspNetCore.Mvc;

// -------------------------------
// Program.cs (top-level statements)
// -------------------------------

var builder = WebApplication.CreateBuilder(args);

// ===== Connection string =====
var connString = builder.Configuration.GetConnectionString("MySql")
    ?? "Server=localhost;Port=3306;Database=veiling_systeem;User ID=root;Password=secret;";

// ===== Swagger/OpenAPI =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== CORS =====
builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(p => p
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .WithOrigins("http://localhost:3000", "http://localhost:5173"));
});

var app = builder.Build();

app.UseCors();

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", () => Results.Redirect("/swagger"));

IDbConnection OpenConn() => new MySqlConnection(connString);

// ===== Endpoints =====

// Registreren
app.MapPost("/auth/register", async Task<IResult> ([FromBody] RegisterDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Naam) ||
        string.IsNullOrWhiteSpace(dto.Emailadres) ||
        string.IsNullOrWhiteSpace(dto.Wachtwoord))
        return Results.BadRequest(new { message = "Naam, emailadres en wachtwoord zijn verplicht." });

    using var conn = OpenConn();

    // bestaat email al?
    var exists = await conn.ExecuteScalarAsync<int>(
        "SELECT COUNT(1) FROM gebruiker WHERE emailadres = @email",
        new { email = dto.Emailadres });

    if (exists > 0) return Results.Conflict(new { message = "Emailadres bestaat al." });

    // maak gebruiker
    var gebruikerId = await conn.ExecuteScalarAsync<int>(
        @"INSERT INTO gebruiker (naam, emailadres) VALUES (@naam, @email);
          SELECT LAST_INSERT_ID();",
        new { naam = dto.Naam, email = dto.Emailadres });

    // hash wachtwoord
    var hash = BCrypt.Net.BCrypt.HashPassword(dto.Wachtwoord, workFactor: 11);

    // account tabel (idempotent)
    await conn.ExecuteAsync(@"
        CREATE TABLE IF NOT EXISTS account (
            account_id INT AUTO_INCREMENT PRIMARY KEY,
            gebruiker_id INT NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            password_algo VARCHAR(50) NOT NULL DEFAULT 'bcrypt',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_account_gebruiker (gebruiker_id),
            CONSTRAINT fk_account_gebruiker FOREIGN KEY (gebruiker_id)
                REFERENCES gebruiker(gebruiker_id) ON DELETE CASCADE
        );");

    await conn.ExecuteAsync(
        "INSERT INTO account (gebruiker_id, password_hash) VALUES (@gid, @hash)",
        new { gid = gebruikerId, hash });

    return Results.Created($"/gebruiker/{gebruikerId}", new { gebruiker_id = gebruikerId, dto.Naam, dto.Emailadres });
})
.WithName("Register")
.WithOpenApi();

// Inloggen
app.MapPost("/auth/login", async Task<IResult> ([FromBody] LoginDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Emailadres) || string.IsNullOrWhiteSpace(dto.Wachtwoord))
        return Results.BadRequest(new { message = "Emailadres en wachtwoord zijn verplicht." });

    using var conn = OpenConn();

    var row = await conn.QueryFirstOrDefaultAsync(@"
        SELECT g.gebruiker_id, g.naam, g.emailadres, a.password_hash,
               CASE WHEN vm.gebruiker_id IS NOT NULL THEN 'Auctioneer' ELSE 'Customer' END AS role
        FROM gebruiker g
        JOIN account a ON a.gebruiker_id = g.gebruiker_id
        LEFT JOIN veiling_meester vm ON vm.gebruiker_id = g.gebruiker_id
        WHERE g.emailadres = @email
        LIMIT 1;",
        new { email = dto.Emailadres });

    if (row is null) return Results.Unauthorized();

    string hash = row.password_hash;
    bool ok = BCrypt.Net.BCrypt.Verify(dto.Wachtwoord, hash);
    if (!ok) return Results.Unauthorized();

    var result = new LoginResult(
        gebruiker_id: (int)row.gebruiker_id,
        naam: (string)row.naam,
        emailadres: (string)row.emailadres,
        role: (string)row.role
    );

    return Results.Ok(result);
})
.WithName("Login")
.WithOpenApi();

// Huidige gebruiker
app.MapGet("/me/{id:int}", async Task<IResult> (int id) =>
{
    using var conn = OpenConn();
    var me = await conn.QueryFirstOrDefaultAsync(
        "SELECT gebruiker_id, naam, emailadres FROM gebruiker WHERE gebruiker_id = @id",
        new { id });
    return me is null ? Results.NotFound() : Results.Ok(me);
})
.WithOpenApi();

app.Run();

// ===== DTOs (types NA top-level statements) =====
public record RegisterDto(string Naam, string Emailadres, string Wachtwoord);
public record LoginDto(string Emailadres, string Wachtwoord);
public record LoginResult(int gebruiker_id, string naam, string emailadres, string role);
