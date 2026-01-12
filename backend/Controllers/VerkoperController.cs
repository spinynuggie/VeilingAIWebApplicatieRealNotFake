using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos; // Importeer de DTO namespace
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    /// <summary>
    /// Controller voor het beheren van verkopergegevens, zakelijke informatie en de koppeling tussen gebruikers en hun verkopersstatus.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class VerkoperController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VerkoperController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(idClaim) || !int.TryParse(idClaim, out var gebruikerId))
            {
                return null;
            }
            return gebruikerId;
        }

        /// <summary>
        /// Haalt een lijst op van alle geregistreerde verkopers in het systeem.
        /// </summary>
        /// <response code="200">Lijst succesvol opgehaald.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Verkoper>>> GetVerkopers()
        {
            return await _context.Verkopers.ToListAsync();
        }

        /// <summary>
        /// Haalt het verkoperprofiel op dat gekoppeld is aan de momenteel ingelogde gebruiker.
        /// </summary>
        /// <response code="200">Eigen verkoperprofiel gevonden.</response>
        /// <response code="401">Niet geautoriseerd.</response>
        /// <response code="404">Geen verkoperprofiel gevonden voor deze gebruiker.</response>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<Verkoper>> GetMyVerkoper()
        {
            var gebruikerId = GetCurrentUserId();
            if (gebruikerId == null) return Unauthorized();

            var verkoper = await _context.Verkopers.FirstOrDefaultAsync(v => v.GebruikerId == gebruikerId);
            if (verkoper == null) return NotFound();

            return verkoper;
        }

        /// <summary>
        /// Haalt een specifiek verkoperprofiel op basis van het unieke VerkoperId.
        /// </summary>
        /// <response code="200">Verkoper gevonden.</response>
        /// <response code="404">Verkoper niet gevonden.</response>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Verkoper>> GetVerkoper(int id)
        {
            var verkoper = await _context.Verkopers.FindAsync(id);

            if (verkoper == null)
            {
                return NotFound();
            }

            return verkoper;
        }

        /// <summary>
        /// Werkt een specifiek verkoperprofiel bij op basis van VerkoperId.
        /// </summary>
        /// <response code="204">Profiel succesvol bijgewerkt.</response>
        /// <response code="404">Verkoper niet gevonden.</response>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutVerkoper(int id, VerkoperDto verkoperDto)
        {
            // 1. Zoek het bestaande domeinmodel
            var verkoper = await _context.Verkopers.FindAsync(id);

            if (verkoper == null)
            {
                return NotFound();
            }

            // 2. Map de DTO velden naar het bestaande domeinmodel
            verkoper.KvkNummer = verkoperDto.KvkNummer;
            verkoper.Bedrijfsgegevens = verkoperDto.Bedrijfsgegevens;
            verkoper.Adresgegevens = verkoperDto.Adresgegevens;
            verkoper.FinancieleGegevens = verkoperDto.FinancieleGegevens;
            
            _context.Entry(verkoper).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VerkoperExists(id))
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

        /// <summary>
        /// Maakt een nieuw verkoperprofiel aan voor de huidige gebruiker of werkt het bestaande profiel bij (Upsert).
        /// </summary>
        /// <response code="201">Nieuw profiel aangemaakt.</response>
        /// <response code="200">Bestaand profiel bijgewerkt.</response>
        [HttpPost("me")]
        [Authorize]
        public async Task<ActionResult<Verkoper>> UpsertMyVerkoper(VerkoperDto verkoperDto)
        {
            var gebruikerId = GetCurrentUserId();
            if (gebruikerId == null) return Unauthorized();

            var existing = await _context.Verkopers.FirstOrDefaultAsync(v => v.GebruikerId == gebruikerId);
            if (existing != null)
            {
                existing.KvkNummer = verkoperDto.KvkNummer;
                existing.Bedrijfsgegevens = verkoperDto.Bedrijfsgegevens;
                existing.Adresgegevens = verkoperDto.Adresgegevens;
                existing.FinancieleGegevens = verkoperDto.FinancieleGegevens;
                _context.Entry(existing).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            var verkoper = new Verkoper
            {
                KvkNummer = verkoperDto.KvkNummer,
                Bedrijfsgegevens = verkoperDto.Bedrijfsgegevens,
                Adresgegevens = verkoperDto.Adresgegevens,
                FinancieleGegevens = verkoperDto.FinancieleGegevens,
                GebruikerId = gebruikerId.Value
            };

            _context.Verkopers.Add(verkoper);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMyVerkoper), new { id = verkoper.VerkoperId }, verkoper);
        }

        /// <summary>
        /// Werkt de verkopergegevens van de momenteel ingelogde gebruiker bij.
        /// </summary>
        /// <response code="204">Succesvol bijgewerkt.</response>
        /// <response code="404">Geen verkoperprofiel gevonden om bij te werken.</response>
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateMyVerkoper(VerkoperDto verkoperDto)
        {
            var gebruikerId = GetCurrentUserId();
            if (gebruikerId == null) return Unauthorized();

            var existing = await _context.Verkopers.FirstOrDefaultAsync(v => v.GebruikerId == gebruikerId);
            if (existing == null) return NotFound();

            existing.KvkNummer = verkoperDto.KvkNummer;
            existing.Bedrijfsgegevens = verkoperDto.Bedrijfsgegevens;
            existing.Adresgegevens = verkoperDto.Adresgegevens;
            existing.FinancieleGegevens = verkoperDto.FinancieleGegevens;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Maakt handmatig een nieuw verkoperprofiel aan zonder automatische koppeling aan de huidige gebruiker.
        /// </summary>
        /// <response code="201">Verkoper succesvol aangemaakt.</response>
        [HttpPost]
        public async Task<ActionResult<Verkoper>> PostVerkoper(VerkoperDto verkoperDto)
        {
            // 1. Map de DTO naar een nieuw domeinmodel
            var verkoper = new Verkoper
            {
                KvkNummer = verkoperDto.KvkNummer,
                Bedrijfsgegevens = verkoperDto.Bedrijfsgegevens,
                Adresgegevens = verkoperDto.Adresgegevens,
                FinancieleGegevens = verkoperDto.FinancieleGegevens
                // VerkoperId wordt automatisch door de database ingesteld
            };
            
            // 2. Voeg toe aan de context
            _context.Verkopers.Add(verkoper);
            await _context.SaveChangesAsync();

            // 3. Retourneer het aangemaakte domeinmodel
            return CreatedAtAction("GetVerkoper", new { id = verkoper.VerkoperId }, verkoper);
        }

        /// <summary>
        /// Verwijdert een verkoperprofiel definitief uit de database.
        /// </summary>
        /// <response code="204">Verkoper succesvol verwijderd.</response>
        /// <response code="404">Verkoper niet gevonden.</response>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteVerkoper(int id)
        {
            var verkoper = await _context.Verkopers.FindAsync(id);
            if (verkoper == null)
            {
                return NotFound();
            }

            _context.Verkopers.Remove(verkoper);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VerkoperExists(int id)
        {
            return _context.Verkopers.Any(e => e.VerkoperId == id);
        }
    }
}
