using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeilingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VeilingController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Veiling (Blijft ongewijzigd, retourneert het domeinmodel)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veiling>>> GetVeiling()
        {
            return await _context.Veiling.ToListAsync();
        }

        // GET: api/Veiling/5 (Blijft ongewijzigd, retourneert het domeinmodel)
        [HttpGet("{id}")]
        public async Task<ActionResult<Veiling>> GetVeiling(int id)
        {
            var veiling = await _context.Veiling.FindAsync(id);

            if (veiling == null)
            {
                return NotFound();
            }

            return veiling;
        }

        // PUT: api/Veiling/5 - GEBRUIKT DTO VOOR INPUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVeiling(int id, VeilingDto veilingDto)
        {
            // 1. Zoek het bestaande domeinmodel
            var veiling = await _context.Veiling.FindAsync(id);
            if (veiling == null)
            {
                return NotFound();
            }
            
            // 2. Map de DTO velden naar het bestaande domeinmodel
            veiling.Naam = veilingDto.Naam;
            veiling.Beschrijving = veilingDto.Beschrijving;
            veiling.Image = veilingDto.Image;
            veiling.Starttijd = veilingDto.Starttijd;
            veiling.Eindtijd   = veilingDto.Eindtijd;
            veiling.VeilingMeesterId = veilingDto.VeilingMeesterId;
            veiling.LocatieId = veilingDto.LocatieId;

            _context.Entry(veiling).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VeilingExists(id))
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

        // POST: api/Veiling - GEBRUIKT DTO VOOR INPUT
        [HttpPost]
        public async Task<ActionResult<Veiling>> PostVeiling(VeilingDto veilingDto)
        {
            // 1. DTO validatie is al uitgevoerd door ValidationFilter
            
            // 2. Business logic validatie
            var existingVeilingMeester = await _context.VeilingMeesters
                .FindAsync(veilingDto.VeilingMeesterId);
            
            if (existingVeilingMeester == null)
            {
                return BadRequest("VeilingMeesterId bestaat niet.");
            }

            // 3. Controleer of er geen conflicterende veilingen zijn
            var conflictingVeiling = await _context.Veiling
                .Where(v => v.VeilingMeesterId == veilingDto.VeilingMeesterId &&
                           ((v.Starttijd <= veilingDto.Starttijd && v.Eindtijd >= veilingDto.Starttijd) ||
                            (v.Starttijd <= veilingDto.Eindtijd && v.Eindtijd >= veilingDto.Eindtijd)))
                .FirstOrDefaultAsync();

            if (conflictingVeiling != null)
            {
                return BadRequest("Deze veilingmeester heeft al een veiling op dit tijdstip.");
            }
            
            // 4. Map de inkomende DTO naar een nieuw domeinmodel
            var veiling = new Veiling
            {
                Naam = veilingDto.Naam,
                Beschrijving = veilingDto.Beschrijving,
                Image = veilingDto.Image,
                Starttijd = veilingDto.Starttijd,
                Eindtijd   = veilingDto.Eindtijd,
                VeilingMeesterId = veilingDto.VeilingMeesterId,
                LocatieId = veilingDto.LocatieId
            };
            
            // 5. Voeg het domeinmodel toe en sla op
            _context.Veiling.Add(veiling);
            await _context.SaveChangesAsync();

            // 6. Retourneer het aangemaakte Veiling domeinmodel
            return CreatedAtAction("GetVeiling", new { id = veiling.VeilingId }, veiling);
        }

        // DELETE: api/Veiling/5 (Blijft ongewijzigd)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiling(int id)
        {
            var veiling = await _context.Veiling.FindAsync(id);
            if (veiling == null)
            {
                return NotFound();
            }

            _context.Veiling.Remove(veiling);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VeilingExists(int id)
        {
            return _context.Veiling.Any(e => e.VeilingId == id);
        }
    }
}
