using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
    /// <summary>
    /// Beheert gebruikersaccounts, beveiligde authenticatie via cookies en rol-gebaseerde autorisatie.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class GebruikerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher _passwordHasher;
        private readonly ILogger<GebruikerController> _logger;
        private readonly IConfiguration _configuration;
        private readonly bool _useSecureCookies;
        private readonly SymmetricSecurityKey _signingKey;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;


        private const int AccessTokenMinutes = 15;
        private const int RefreshTokenDays = 7;
        private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
        {
            "KOPER",
            "VERKOPER",
            "VEILINGMEESTER"
        };

        public GebruikerController(
            AppDbContext context,
            PasswordHasher passwordHasher,
            ILogger<GebruikerController> logger,
            IConfiguration configuration)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _logger = logger;
            _configuration = configuration;
            _useSecureCookies = string.Equals(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"), "Production", StringComparison.OrdinalIgnoreCase);
            _jwtIssuer = _configuration["Jwt:Issuer"] ?? "VeilingAI";
            _jwtAudience = _configuration["Jwt:Audience"] ?? "VeilingAIUsers";

            var key = _configuration["Jwt:Key"] ?? "dev-secret-change-me";
            _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        }

        // Helper functie om de Entiteit naar DTO te mappen
        private GebruikerResponseDto MapToResponseDto(Gebruiker gebruiker)
        {
            return new GebruikerResponseDto
            {
                GebruikerId = gebruiker.GebruikerId,
                Naam = gebruiker.Naam,
                Emailadres = gebruiker.Emailadres,
                Straat = gebruiker.Straat,
                Huisnummer = gebruiker.Huisnummer,
                Postcode = gebruiker.Postcode,
                Woonplaats = gebruiker.Woonplaats,
                Role = gebruiker.Role
            };
        }

        private string GenerateAccessToken(Gebruiker gebruiker)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, gebruiker.GebruikerId.ToString()),
                new Claim(ClaimTypes.Email, gebruiker.Emailadres),
                new Claim(ClaimTypes.Role, gebruiker.Role ?? "KOPER")
            };

            var creds = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtIssuer,
                audience: _jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(AccessTokenMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<RefreshToken> CreateRefreshTokenAsync(int gebruikerId, RefreshToken? previous = null)
        {
            var refreshToken = new RefreshToken
            {
                GebruikerId = gebruikerId,
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenDays),
                CreatedAt = DateTime.UtcNow
            };

            if (previous != null)
            {
                previous.Revoked = true;
                previous.ReplacedByToken = refreshToken.Token;
            }

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken;
        }

        private async Task IssueTokensAsync(Gebruiker gebruiker, RefreshToken? previous = null)
        {
            var refreshToken = await CreateRefreshTokenAsync(gebruiker.GebruikerId, previous);
            var accessToken = GenerateAccessToken(gebruiker);
            SetAuthCookies(accessToken, refreshToken);
        }

        private void SetAuthCookies(string accessToken, RefreshToken refreshToken)
        {
            var accessOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Must be true for SameSite=None
                SameSite = SameSiteMode.None, // Required for cross-site (Vercel -> sslip.io)
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddMinutes(AccessTokenMinutes)
            };

            var refreshOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = refreshToken.ExpiresAt
            };

            // CSRF double-submit token (non-HttpOnly)
            var xsrfToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var xsrfOptions = new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddMinutes(AccessTokenMinutes)
            };

            Response.Cookies.Append("access_token", accessToken, accessOptions);
            Response.Cookies.Append("refresh_token", refreshToken.Token, refreshOptions);
            Response.Cookies.Append("XSRF-TOKEN", xsrfToken, xsrfOptions);

            // Also send as header for Cross-Origin clients that can't read cookies
            Response.Headers["X-XSRF-TOKEN"] = xsrfToken;
        }

        private void ClearAuthCookies()
        {
            var expired = new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddDays(-1),
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            };

            Response.Cookies.Append("access_token", string.Empty, expired);
            Response.Cookies.Append("refresh_token", string.Empty, expired);
            Response.Cookies.Append("XSRF-TOKEN", string.Empty, expired);
        }
        
        /// <summary>
        /// Haalt een lijst op van alle geregistreerde gebruikers (alleen toegankelijk voor geautoriseerde gebruikers).
        /// </summary>
        /// <response code="200">Lijst succesvol opgehaald.</response>
        /// <response code="401">Niet geautoriseerd.</response>
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<GebruikerResponseDto>>> GetGebruikers()
        {
            var gebruikers = await _context.Gebruikers.ToListAsync();
    
            // Map ORM models to DTOs before returning
            return gebruikers.Select(MapToResponseDto).ToList();
        }
        
        /// <summary>
        /// Haalt de details van een specifieke gebruiker op via ID.
        /// </summary>
        /// <response code="200">Gebruiker gevonden.</response>
        /// <response code="404">Gebruiker niet gevonden.</response>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<GebruikerResponseDto>> GetGebruiker(int id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);

            if (gebruiker == null)
            {
                return NotFound();
            }

            // Stuur DTO terug i.p.v. de Entiteit
            return MapToResponseDto(gebruiker);
        }
        
        /// <summary>
        /// Wijzigt de profielgegevens (NAW) van een bestaande gebruiker.
        /// </summary>
        /// <response code="204">Profiel succesvol bijgewerkt.</response>
        /// <response code="404">Gebruiker niet gevonden.</response>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutGebruiker(int id, GebruikerUpdateDto gebruikerDto)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);

            if (gebruiker == null)
            {
                return NotFound();
            }
            
            // Map DTO velden naar de Entiteit (geen wachtwoord/role aanpassingen hier)
            gebruiker.Naam = gebruikerDto.Naam;
            gebruiker.Emailadres = gebruikerDto.Emailadres;
            gebruiker.Straat = gebruikerDto.Straat;
            gebruiker.Huisnummer = gebruikerDto.Huisnummer;
            gebruiker.Postcode = gebruikerDto.Postcode;
            gebruiker.Woonplaats = gebruikerDto.Woonplaats;
        
            _context.Entry(gebruiker).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // De GebruikerExists check is hier niet meer nodig omdat we de Entiteit al hebben opgehaald.
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Wijzigt de rol van de gebruiker (KOPER, VERKOPER, VEILINGMEESTER). Genereert nieuwe tokens voor claim-synchronisatie.
        /// </summary>
        /// <response code="200">Rol succesvol bijgewerkt.</response>
        /// <response code="400">Ongeldige rol opgegeven.</response>
        /// <response code="403">Geen rechten om de rol van een andere gebruiker te wijzigen.</response>
        [HttpPut("{id}/role")]
        [Authorize]
        public async Task<ActionResult<GebruikerResponseDto>> UpdateRole(int id, [FromBody] RoleUpdateDto dto)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            if (currentUserId != id)
            {
                return Forbid();
            }

            var normalizedRole = dto.Role?.ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalizedRole) || !AllowedRoles.Contains(normalizedRole))
            {
                return BadRequest("Ongeldige rol.");
            }

            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null)
            {
                return NotFound();
            }

            gebruiker.Role = normalizedRole;
            _context.Entry(gebruiker).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Nieuwe tokens uitgeven zodat de Role-claim direct meekomt
            await IssueTokensAsync(gebruiker);

            return MapToResponseDto(gebruiker);
        }
        /// <summary>
        /// Maakt een nieuwe gebruiker aan met de standaardrol KOPER.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<GebruikerResponseDto>> PostGebruiker(GebruikerCreateDto gebruikerDto)
        {
            var gebruiker = new Gebruiker
            {
                Emailadres = gebruikerDto.Emailadres,
                Role = "KOPER",
                Wachtwoord = _passwordHasher.Hash(gebruikerDto.Wachtwoord)
            };

            _context.Gebruikers.Add(gebruiker);
            await _context.SaveChangesAsync();

            await IssueTokensAsync(gebruiker);
            return CreatedAtAction("GetGebruiker", new { id = gebruiker.GebruikerId }, MapToResponseDto(gebruiker));
        }
        /// <summary>
        /// Registreert een nieuwe gebruiker via het publieke formulier.
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
        {
            var existing = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Emailadres.ToLower() == request.Emailadres.ToLower());

            if (existing != null) return BadRequest("E-mailadres is al geregistreerd.");

            var gebruiker = new Gebruiker
            {
                Emailadres = request.Emailadres,
                Wachtwoord = _passwordHasher.Hash(request.Wachtwoord),
                Role = "KOPER"
            };

            _context.Gebruikers.Add(gebruiker);
            await _context.SaveChangesAsync();

            await IssueTokensAsync(gebruiker);

            return CreatedAtAction("GetGebruiker", new { id = gebruiker.GebruikerId }, new AuthResponseDto 
            { 
                Message = "Registratie geslaagd", 
                Gebruiker = MapToResponseDto(gebruiker) 
            });
        }
        
        /// <summary>
        /// Verwijdert een gebruiker definitief uit het systeem.
        /// </summary>
        /// <response code="204">Gebruiker succesvol verwijderd.</response>
        /// <response code="404">Gebruiker niet gevonden.</response>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteGebruiker(int id)
        {
            var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Alleen toestaan als de ID in de route matcht met de ID in de JWT claim
            if (currentUserId != id)
            {
                return Forbid(); 
            }

            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null) return NotFound();

            _context.Gebruikers.Remove(gebruiker);
            await _context.SaveChangesAsync();

            ClearAuthCookies(); 
            return NoContent();
        }
        
        
        /// <summary>
        /// Valideert credentials en stelt de HttpOnly Auth-cookies in.
        /// </summary>
        /// <response code="200">Login succesvol.</response>
        /// <response code="401">Ongeldig wachtwoord.</response>
        /// <response code="404">E-mailadres niet bekend.</response>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto loginRequest)
        {
            var gebruiker = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Emailadres.ToLower() == loginRequest.Emailadres.ToLower());

            if (gebruiker == null) return NotFound("Gebruiker niet gevonden.");

            if (!_passwordHasher.Verify(loginRequest.Wachtwoord, gebruiker.Wachtwoord))
            {
                return Unauthorized("Ongeldig wachtwoord.");
            }

            await IssueTokensAsync(gebruiker);

            return Ok(new AuthResponseDto
            {
                Message = "Login geslaagd!",
                Gebruiker = MapToResponseDto(gebruiker)
            });
        }
        
        /// <summary>
        /// Haalt de gegevens van de huidige ingelogde gebruiker op en ververst de CSRF-tokens.
        /// </summary>
        /// <response code="200">Gebruikergegevens geretourneerd.</response>
        /// <response code="401">Sessie niet langer geldig.</response>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<GebruikerResponseDto>> GetCurrentUser()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var gebruikerId))
            {
                return Unauthorized();
            }

            var gebruiker = await _context.Gebruikers.FindAsync(gebruikerId);
            if (gebruiker == null)
            {
                return Unauthorized();
            }

            // Ensure we have a fresh CSRF token for the session (improtant for page reloads)
            // We usually don't need to refresh the access token here, but we MUST send the CSRF token header
            // Re-issuing tokens is the easiest way to keep everything in sync
            await IssueTokensAsync(gebruiker);

            // Retourneer DTO
            return MapToResponseDto(gebruiker);
        }
        
        /// <summary>
        /// Logt de gebruiker uit door het Refresh Token te revoken en de cookies te wissen.
        /// </summary>
        /// <response code="204">Succesvol uitgelogd.</response>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refresh_token"];
            if (!string.IsNullOrWhiteSpace(refreshToken))
            {
                var tokenEntity = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
                if (tokenEntity != null)
                {
                    tokenEntity.Revoked = true;
                    await _context.SaveChangesAsync();
                }
            }

            ClearAuthCookies();
            return NoContent();
        }

        /// <summary>
        /// Gebruikt het Refresh Token om een nieuw Access Token aan te vragen zonder opnieuw in te loggen.
        /// </summary>
        /// <response code="200">Tokens succesvol vernieuwd.</response>
        /// <response code="401">Refresh Token is ongeldig of verlopen.</response>
        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponseDto>> Refresh()
        {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrWhiteSpace(refreshToken)) return Unauthorized();

            var tokenEntity = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
            if (tokenEntity == null || tokenEntity.Revoked || tokenEntity.ExpiresAt < DateTime.UtcNow)
            {
                return Unauthorized();
            }

            var gebruiker = await _context.Gebruikers.FindAsync(tokenEntity.GebruikerId);
            if (gebruiker == null) return Unauthorized();

            await IssueTokensAsync(gebruiker, tokenEntity);

            return Ok(new AuthResponseDto 
            { 
                Message = "Token vernieuwd", 
                Gebruiker = MapToResponseDto(gebruiker) 
            });
        }
        
        // De nested classes RegisterRequest en LoginRequest kunnen hier blijven staan,
        // maar kunnen beter verplaatst worden naar de backend.Dtos map als aparte DTO's.
        public class RegisterRequest
        {
            public string Emailadres { get; set; } = string.Empty;
            public string Wachtwoord { get; set; } = string.Empty;
            public string? Naam { get; set; }
        }

        public class LoginRequest
        {
            public string Emailadres { get; set; } = string.Empty;
            public string Wachtwoord { get; set; } = string.Empty;
        }
    }
} 
