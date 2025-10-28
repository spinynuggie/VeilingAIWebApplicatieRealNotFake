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
    public class AankoopController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AankoopController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Aankoop
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aankoop>>> GetAankoop()
        {
            return await _context.Aankoop.ToListAsync();
        }

        // GET: api/Aankoop/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Aankoop>> GetAankoop(int id)
        {
            var aankoop = await _context.Aankoop.FindAsync(id);

            if (aankoop == null)
            {
                return NotFound();
            }

            return aankoop;
        }

        // PUT: api/Aankoop/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAankoop(int id, Aankoop aankoop)
        {
            if (id != aankoop.AankoopId)
            {
                return BadRequest();
            }

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

        // POST: api/Aankoop
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Aankoop>> PostAankoop(Aankoop aankoop)
        {
            _context.Aankoop.Add(aankoop);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAankoop", new { id = aankoop.AankoopId }, aankoop);
        }

        // DELETE: api/Aankoop/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAankoop(int id)
        {
            var aankoop = await _context.Aankoop.FindAsync(id);
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
