using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Dtos;
using System.Linq;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GebruikerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher _passwordHasher;
        private readonly ILogger<GebruikerController> _logger;

        public GebruikerController(AppDbContext context, PasswordHasher passwordHasher, ILogger<GebruikerController> logger)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _logger = logger;
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
                Woonplaats = gebruiker.Woonplaats
            };
        }

        // GET: api/Gebruiker (GEBRUIKT DTO VOOR OUTPUT)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GebruikerResponseDto>>> GetGebruikers()
        {
            var gebruikers = await _context.Gebruikers.ToListAsync();
    
            // Map ORM models to DTOs before returning
            return gebruikers.Select(MapToResponseDto).ToList();
        }

        // GET: api/Gebruiker/5 (GEBRUIKT DTO VOOR OUTPUT)
        [HttpGet("{id}")]
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

            // Stuur DTO terug
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

            // Stuur DTO terug
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

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, gebruiker.GebruikerId.ToString()),
                new Claim(ClaimTypes.Email, gebruiker.Emailadres),
                new Claim(ClaimTypes.Role, gebruiker.Role ?? "KOPER")
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

            // Retourneer een anoniem object dat overeenkomt met de DTO-structuur (veilig)
            return Ok(new
            {
                message = "Login geslaagd!",
                gebruiker = new { gebruiker.GebruikerId, gebruiker.Naam, gebruiker.Emailadres }
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

            // Retourneer DTO
            return MapToResponseDto(gebruiker);
        }

        // POST: api/Gebruiker/logout (Onveranderd)
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return NoContent();
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