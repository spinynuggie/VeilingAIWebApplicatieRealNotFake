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

        // GET: api/Verkoper (Blijft ongewijzigd, retourneert het domeinmodel)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Verkoper>>> GetVerkopers()
        {
            return await _context.Verkopers.ToListAsync();
        }

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

        // GET: api/Verkoper/5 (Blijft ongewijzigd, retourneert het domeinmodel)
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

        // PUT: api/Verkoper/5 - GEBRUIKT DTO VOOR INPUT
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

        // POST: api/Verkoper - GEBRUIKT DTO VOOR INPUT
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

        // DELETE: api/Verkoper/5 (Blijft ongewijzigd)
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
