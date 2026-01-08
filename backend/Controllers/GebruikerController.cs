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

        // GET: api/Gebruiker (GEBRUIKT DTO VOOR OUTPUT)
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<GebruikerResponseDto>>> GetGebruikers()
        {
            var gebruikers = await _context.Gebruikers.ToListAsync();
    
            // Map ORM models to DTOs before returning
            return gebruikers.Select(MapToResponseDto).ToList();
        }

        // GET: api/Gebruiker/5 (GEBRUIKT DTO VOOR OUTPUT)
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

        // PUT: api/Gebruiker/5 (GEBRUIKT DTO VOOR INPUT)
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

        // POST: api/Gebruiker (GEBRUIKT DTO VOOR INPUT, VERVANGT OUDE POST)
        [HttpPost]
        public async Task<ActionResult<GebruikerResponseDto>> PostGebruiker(GebruikerCreateDto gebruikerDto)
        {
            // Entiteit aanmaken op basis van DTO
            var gebruiker = new Gebruiker
            {
                Emailadres = gebruikerDto.Emailadres,
                Naam = gebruikerDto.Naam,
                Role = "KOPER", // Role wordt hardgecodeerd
                Wachtwoord = _passwordHasher.Hash(gebruikerDto.Wachtwoord)
            };

            _context.Gebruikers.Add(gebruiker);
            await _context.SaveChangesAsync();

            await IssueTokensAsync(gebruiker);

            return CreatedAtAction("GetGebruiker", new { id = gebruiker.GebruikerId }, MapToResponseDto(gebruiker));
        }

        // DELETE: api/Gebruiker/5 (Onveranderd, werkt met ID)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGebruiker(int id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null)
            {
                return NotFound();
            }

            _context.Gebruikers.Remove(gebruiker);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        // --- AUTHENTICATION ENDPOINTS (Gebruikt nu DTO's voor Login/Register) ---
        
        // Opmerking: Voor een schone architectuur zouden RegisterRequest en LoginRequest
        // nu ook aparte DTO-klassen moeten zijn in de backend.Dtos namespace.
        // We laten de huidige nested classes staan, maar gebruiken de DTO's voor de response.

        // POST: api/Gebruiker/register
        [HttpPost("register")]
        public async Task<ActionResult<GebruikerResponseDto>> Register([FromBody] RegisterRequest request)
        {
            var existing = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Emailadres.ToLower() == request.Emailadres.ToLower());

            if (existing != null)
            {
                return BadRequest("E-mailadres is al geregistreerd.");
            }

            // Input validatie zou hier al door DTO's moeten worden gedaan, maar we houden de check
            if (string.IsNullOrWhiteSpace(request.Wachtwoord))
            {
                return BadRequest("Wachtwoord is verplicht.");
            }

            var gebruiker = new Gebruiker
            {
                Emailadres = request.Emailadres,
                Naam = request.Naam,
                Wachtwoord = _passwordHasher.Hash(request.Wachtwoord),
                Role = "KOPER"
            };

            _context.Gebruikers.Add(gebruiker);
            await _context.SaveChangesAsync();

            var accessToken = GenerateAccessToken(gebruiker);
            var refreshToken = await CreateRefreshTokenAsync(gebruiker.GebruikerId);
            SetAuthCookies(accessToken, refreshToken);

            return CreatedAtAction("GetGebruiker", new { id = gebruiker.GebruikerId }, MapToResponseDto(gebruiker));
        }

        // POST: api/Gebruiker/login (Onveranderd, retourneert al een anoniem object)
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            if (string.IsNullOrEmpty(loginRequest.Emailadres) || string.IsNullOrEmpty(loginRequest.Wachtwoord))
            {
                return BadRequest("E-mail en wachtwoord zijn verplicht.");
            }

            var gebruiker = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Emailadres.ToLower() == loginRequest.Emailadres.ToLower());

            if (gebruiker == null)
            {
                return NotFound("Gebruiker niet gevonden.");
            }

            if (!_passwordHasher.Verify(loginRequest.Wachtwoord, gebruiker.Wachtwoord))
            {
                return Unauthorized("Ongeldig wachtwoord.");
            }

            await IssueTokensAsync(gebruiker);

            return Ok(new
            {
                message = "Login geslaagd!",
                gebruiker = new { gebruiker.GebruikerId, gebruiker.Naam, gebruiker.Emailadres, Role = gebruiker.Role }
            });
        }

        // GET: api/Gebruiker/me (GEBRUIKT DTO VOOR OUTPUT)
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

        // POST: api/Gebruiker/logout (Onveranderd)
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

        [HttpPost("refresh")]
        public async Task<ActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return Unauthorized("Geen refresh token gevonden.");
            }

            var tokenEntity = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == refreshToken);
            if (tokenEntity == null || tokenEntity.Revoked || tokenEntity.ExpiresAt < DateTime.UtcNow)
            {
                return Unauthorized("Refresh token ongeldig of verlopen.");
            }

            var gebruiker = await _context.Gebruikers.FindAsync(tokenEntity.GebruikerId);
            if (gebruiker == null)
            {
                return Unauthorized();
            }

            await IssueTokensAsync(gebruiker, tokenEntity);

            return Ok(new { message = "Token vernieuwd." });
        }

        private bool GebruikerExists(int id)
        {
            return _context.Gebruikers.Any(e => e.GebruikerId == id);
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
