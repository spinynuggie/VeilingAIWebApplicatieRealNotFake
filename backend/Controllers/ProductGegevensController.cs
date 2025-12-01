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
    public class ProductGegevensController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductGegevensController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ProductGegevens
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductGegevens>>> GetProductGegevens()
        {
            return await _context.ProductGegevens.ToListAsync();
        }

        // GET: api/ProductGegevens/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductGegevens>> GetProductGegevens(int id)
        {
            var productGegevens = await _context.ProductGegevens.FindAsync(id);

            if (productGegevens == null)
            {
                return NotFound();
            }

            return productGegevens;
        }

        // PUT: api/ProductGegevens/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProductGegevens(int id, ProductGegevens productGegevens)
        {
            if (id != productGegevens.ProductId)
            {
                return BadRequest();
            }

            _context.Entry(productGegevens).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductGegevensExists(id))
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

        // POST: api/ProductGegevens
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ProductGegevens>> PostProductGegevens(ProductGegevens productGegevens)
        {
            _context.ProductGegevens.Add(productGegevens);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProductGegevens", new { id = productGegevens.ProductId }, productGegevens);
        }

        // DELETE: api/ProductGegevens/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductGegevens(int id)
        {
            var productGegevens = await _context.ProductGegevens.FindAsync(id);
            if (productGegevens == null)
            {
                return NotFound();
            }

            _context.ProductGegevens.Remove(productGegevens);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductGegevensExists(int id)
        {
            return _context.ProductGegevens.Any(e => e.ProductId == id);
        }
    }
}
