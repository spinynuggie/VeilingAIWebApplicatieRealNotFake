using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GebruikerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GebruikerController(AppDbContext context)
        {
            _context = context;
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Gebruiker>> PostGebruiker(Gebruiker gebruiker)
        {
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

        // POST: api/Gebruiker/register
        [HttpPost("register")]
        public async Task<ActionResult<Gebruiker>> Register(Gebruiker gebruiker)
        {
            var existing = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Emailadres.ToLower() == gebruiker.Emailadres.ToLower());

            if (existing != null)
            {
                return BadRequest("E-mailadres is al geregistreerd.");
            }

            _context.Gebruikers.Add(gebruiker);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetGebruiker", new { id = gebruiker.GebruikerId }, gebruiker);
        }

        // POST: api/Gebruiker/login
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] Gebruiker loginRequest)
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

            if (gebruiker.Wachtwoord != loginRequest.Wachtwoord)
            {
                return Unauthorized("Ongeldig wachtwoord.");
            }

            return Ok(new
            {
                message = "Login geslaagd!",
                gebruiker = new { gebruiker.GebruikerId, gebruiker.Naam, gebruiker.Emailadres }
            });
        }

        private bool GebruikerExists(int id)
        {
            return _context.Gebruikers.Any(e => e.GebruikerId == id);
        }
    }
}
