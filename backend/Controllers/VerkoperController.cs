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
    public class VerkoperController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VerkoperController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Verkoper
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Verkoper>>> GetVerkopers()
        {
            return await _context.Verkopers.ToListAsync();
        }

        // GET: api/Verkoper/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Verkoper>> GetVerkoper(int id)
        {
            var verkoper = await _context.Verkopers.FindAsync(id);

            if (verkoper == null)
            {
                return NotFound();
            }

            return verkoper;
        }

        // PUT: api/Verkoper/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVerkoper(int id, Verkoper verkoper)
        {
            if (id != verkoper.VerkoperId)
            {
                return BadRequest();
            }

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

        // POST: api/Verkoper
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Verkoper>> PostVerkoper(Verkoper verkoper)
        {
            _context.Verkopers.Add(verkoper);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVerkoper", new { id = verkoper.VerkoperId }, verkoper);
        }

        // DELETE: api/Verkoper/5
        [HttpDelete("{id}")]
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
