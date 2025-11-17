using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GebruikerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher _passwordHasher;

        public GebruikerController(AppDbContext context, PasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        // GET: api/Gebruiker
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Gebruiker>>> GetGebruikers()
        {
            return await _context.Gebruikers.ToListAsync();
        }

        // GET: api/Gebruiker/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Gebruiker>> GetGebruiker(int id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);

            if (gebruiker == null)
            {
                return NotFound();
            }

            return gebruiker;
        }

        // PUT: api/Gebruiker/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGebruiker(int id, Gebruiker gebruiker)
        {
            if (id != gebruiker.GebruikerId)
            {
                return BadRequest();
            }

            _context.Entry(gebruiker).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GebruikerExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Gebruiker
        [HttpPost]
        public async Task<ActionResult<Gebruiker>> PostGebruiker(Gebruiker gebruiker)
        {
            if (string.IsNullOrWhiteSpace(gebruiker.Wachtwoord))
            {
                return BadRequest("Wachtwoord is verplicht.");
            }

            gebruiker.Role = string.IsNullOrWhiteSpace(gebruiker.Role) ? "KOPER" : gebruiker.Role;
            gebruiker.Wachtwoord = _passwordHasher.Hash(gebruiker.Wachtwoord);

            _context.Gebruikers.Add(gebruiker);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetGebruiker", new { id = gebruiker.GebruikerId }, gebruiker);
        }

        // DELETE: api/Gebruiker/5
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

        // POST: api/Gebruiker/register
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterRequest request)
        {
            var existing = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Emailadres.ToLower() == request.Emailadres.ToLower());

            if (existing != null)
            {
                return BadRequest("E-mailadres is al geregistreerd.");
            }

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

            return CreatedAtAction("GetGebruiker", new { id = gebruiker.GebruikerId }, gebruiker);
        }

        // POST: api/Gebruiker/login
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

            return Ok(new
            {
                message = "Login geslaagd!",
                gebruiker = new { gebruiker.GebruikerId, gebruiker.Naam, gebruiker.Emailadres }
            });
        }

        // GET: api/Gebruiker/me
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult> GetCurrentUser()
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

            return Ok(new
            {
                gebruikerId = gebruiker.GebruikerId,
                naam = gebruiker.Naam,
                emailadres = gebruiker.Emailadres,
                role = gebruiker.Role ?? "KOPER",
                straat = gebruiker.Straat,
                huisnummer = gebruiker.Huisnummer,
                postcode = gebruiker.Postcode,
                woonplaats = gebruiker.Woonplaats
            });
        }

        // POST: api/Gebruiker/logout
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
    }
}
