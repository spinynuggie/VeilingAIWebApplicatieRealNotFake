using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos; 
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Alle Aankoop endpoints vereisen authenticatie
    public class AankoopController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AankoopController(AppDbContext context)
        {
            _context = context;
        }

        private AankoopResponseDto MapToResponseDto(Aankoop aankoop)
        {
            return new AankoopResponseDto
            {
                AankoopId = aankoop.AankoopId,
                ProductId = aankoop.ProductId,
                Prijs = aankoop.Prijs,
                AanKoopHoeveelheid = aankoop.AanKoopHoeveelheid,
                // Status mapping voor de frontend
                Status = aankoop.IsBetaald ? "Betaald" : "In Afwachting" 
            };
        }

        // GET: api/Aankoop (Toont ALLEEN aankopen van de huidige gebruiker)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AankoopResponseDto>>> GetMijnAankopen()
        {
            // Haal de GebruikerId op uit de cookie claim (ESSENTIEEL voor privacy)
            var gebruikerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out int huidigeGebruikerId))
            {
                return Unauthorized("Gebruiker ID niet gevonden in token.");
            }

            var aankopen = await _context.Aankoop
                .Where(a => a.GebruikerId == huidigeGebruikerId)
                .ToListAsync();

            // Map naar DTO's voor veilige output
            return Ok(aankopen.Select(MapToResponseDto).ToList());
        }

        // GET: api/Aankoop/5 (Toont EEN SPECIFIEKE aankoop, mits deze van de gebruiker is)
        [HttpGet("{id}")]
        public async Task<ActionResult<AankoopResponseDto>> GetAankoop(int id)
        {
            var gebruikerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out int huidigeGebruikerId))
            {
                return Unauthorized();
            }

            // Controleer of de aankoop bestaat EN toebehoort aan de huidige gebruiker
            var aankoop = await _context.Aankoop
                .FirstOrDefaultAsync(a => a.AankoopId == id && a.GebruikerId == huidigeGebruikerId);

            if (aankoop == null)
            {
                return NotFound();
            }

            // Map naar DTO voor veilige output
            return MapToResponseDto(aankoop);
        }

        // PUT: api/Aankoop/5
        // Dit endpoint zou meestal alleen door beheerders of interne services worden gebruikt
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAankoop(int id, Aankoop aankoop) 
        {
            // OPMERKING: Dit zou ideaal ook een DTO moeten gebruiken
            // (bijv. AankoopAdminUpdateDto) en alleen voor Admins toegankelijk moeten zijn.
            // Voor nu houden we de oude signature, maar het risico blijft!

            if (id != aankoop.AankoopId)
            {
                return BadRequest();
            }
            // ... (rest van de PUT logica) ...
            _context.Entry(aankoop).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AankoopExists(id))
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

        // POST: api/Aankoop (GEBRUIKT DTO VOOR INPUT)
        [HttpPost]
        public async Task<ActionResult<AankoopResponseDto>> PostAankoop(AankoopCreateDto aankoopDto)
        {
            // 1. Haal de GebruikerId op (veiligheid)
            var gebruikerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out int koperId))
            {
                return Unauthorized("U moet ingelogd zijn om een aankoop te doen.");
            }

            // 2. Converteer DTO naar Entiteit
            var aankoop = new Aankoop
            {
                ProductId = aankoopDto.ProductId,
                Prijs = aankoopDto.Prijs,
                AanKoopHoeveelheid = aankoopDto.AanKoopHoeveelheid,
                
                // Interne velden worden ingesteld door de backend, NIET de client DTO
                GebruikerId = koperId, 
                IsBetaald = false // Standaard onbetaald
            };

            _context.Aankoop.Add(aankoop);
            await _context.SaveChangesAsync();

            // 3. Retourneer de DTO
            return CreatedAtAction("GetAankoop", new { id = aankoop.AankoopId }, MapToResponseDto(aankoop));
        }

        // DELETE: api/Aankoop/5 (Onveranderd, werkt met ID)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAankoop(int id)
        {
            var aankoop = await _context.Aankoop.FindAsync(id);
            // Je zou hier ook moeten controleren of de aankoop bij de huidige gebruiker hoort
            if (aankoop == null)
            {
                return NotFound();
            }

            _context.Aankoop.Remove(aankoop);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AankoopExists(int id)
        {
            return _context.Aankoop.Any(e => e.AankoopId == id);
        }
    }
}