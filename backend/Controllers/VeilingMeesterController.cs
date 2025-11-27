using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos; // Importeer de DTO namespace

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeilingMeesterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VeilingMeesterController(AppDbContext context)
        {
            _context = context;
        }

        // ... GET methoden blijven ongewijzigd ...

        // PUT: api/VeilingMeester/5 - GEBRUIKT DTO VOOR INPUT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVeilingMeester(int id, VeilingMeesterDto veilingMeesterDto)
        {
            var veilingMeester = await _context.VeilingMeesters.FindAsync(id);
            
            if (veilingMeester == null)
            {
                return NotFound();
            }

            // Map de DTO naar het bestaande domeinmodel
            veilingMeester.GebruikerId = veilingMeesterDto.GebruikerId;

            _context.Entry(veilingMeester).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VeilingMeesterExists(id))
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

        // POST: api/VeilingMeester - GEBRUIKT DTO VOOR INPUT
        [HttpPost]
        public async Task<ActionResult<VeilingMeester>> PostVeilingMeester(VeilingMeesterDto veilingMeesterDto)
        {
            // Map de DTO naar een nieuw domeinmodel. MeesterId wordt automatisch gegenereerd.
            var veilingMeester = new VeilingMeester
            {
                GebruikerId = veilingMeesterDto.GebruikerId
            };

            _context.VeilingMeesters.Add(veilingMeester);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVeilingMeester", new { id = veilingMeester.MeesterId }, veilingMeester);
        }

        // ... DELETE en VeilingMeesterExists methoden blijven ongewijzigd ...

        // DELETE: api/VeilingMeester/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeilingMeester(int id)
        {
            var veilingMeester = await _context.VeilingMeesters.FindAsync(id);
            if (veilingMeester == null)
            {
                return NotFound();
            }

            _context.VeilingMeesters.Remove(veilingMeester);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VeilingMeesterExists(int id)
        {
            return _context.VeilingMeesters.Any(e => e.MeesterId == id);
        }
    }
}