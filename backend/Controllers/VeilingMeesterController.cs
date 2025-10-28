using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

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

        // GET: api/VeilingMeester
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VeilingMeester>>> GetVeilingMeesters()
        {
            return await _context.VeilingMeesters.ToListAsync();
        }

        // GET: api/VeilingMeester/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VeilingMeester>> GetVeilingMeester(int id)
        {
            var veilingMeester = await _context.VeilingMeesters.FindAsync(id);

            if (veilingMeester == null)
            {
                return NotFound();
            }

            return veilingMeester;
        }

        // PUT: api/VeilingMeester/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVeilingMeester(int id, VeilingMeester veilingMeester)
        {
            if (id != veilingMeester.MeesterId)
            {
                return BadRequest();
            }

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

        // POST: api/VeilingMeester
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<VeilingMeester>> PostVeilingMeester(VeilingMeester veilingMeester)
        {
            _context.VeilingMeesters.Add(veilingMeester);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVeilingMeester", new { id = veilingMeester.MeesterId }, veilingMeester);
        }

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
