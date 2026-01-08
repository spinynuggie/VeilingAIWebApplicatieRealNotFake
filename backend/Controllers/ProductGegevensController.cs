using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos;

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
            var products = await _context.ProductGegevens.ToListAsync();
            
            // Output validatie - filter en clean de data
            var validatedProducts = products
                .Where(p => p.ProductId > 0 && 
                           !string.IsNullOrWhiteSpace(p.ProductNaam))
                .Select(p => new ProductGegevens
                {
                    ProductId = p.ProductId,
                    ProductNaam = p.ProductNaam?.Trim() ?? "",
                    ProductBeschrijving = string.IsNullOrWhiteSpace(p.ProductBeschrijving) ? "" : p.ProductBeschrijving.Trim(),
                    Fotos = string.IsNullOrWhiteSpace(p.Fotos) ? "" : p.Fotos.Trim(),
                    Hoeveelheid = Math.Max(0, p.Hoeveelheid), // Negatieve hoeveelheid niet toegestaan
                    EindPrijs = Math.Max(0, p.EindPrijs) // Negatieve prijs niet toegestaan
                })
                .Take(100) // Limit voor performance
                .ToList();

            return Ok(validatedProducts);
        }

        // GET: api/ProductGegevens/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductGegevens>> GetProductGegevens(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Product ID moet positief zijn.");
            }

            var productGegevens = await _context.ProductGegevens.FindAsync(id);

            if (productGegevens == null)
            {
                return NotFound();
            }

            // Output validatie - clean de single product data
            var validatedProduct = new ProductGegevens
            {
                ProductId = productGegevens.ProductId,
                ProductNaam = productGegevens.ProductNaam?.Trim() ?? "",
                ProductBeschrijving = string.IsNullOrWhiteSpace(productGegevens.ProductBeschrijving) ? "" : productGegevens.ProductBeschrijving.Trim(),
                Fotos = string.IsNullOrWhiteSpace(productGegevens.Fotos) ? "" : productGegevens.Fotos.Trim(),
                Hoeveelheid = Math.Max(0, productGegevens.Hoeveelheid),
                EindPrijs = Math.Max(0, productGegevens.EindPrijs)
            };

            return Ok(validatedProduct);
        }

        // PUT: api/ProductGegevens/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProductGegevens(int id, ProductVeilingUpdateDto productUpdate)
        {
            // 1. Check of ID in URL matcht met ID in body
            if (id != productUpdate.ProductId)
            {
                return BadRequest($"Product ID in URL ({id}) matcht niet met Body ({productUpdate.ProductId}).");
            }

            // 2. Haal het BESTAANDE product op uit de database
            var existingProduct = await _context.ProductGegevens.FindAsync(id);

            if (existingProduct == null)
            {
                return NotFound();
            }

            // 3. Update de velden
            existingProduct.VeilingId = productUpdate.VeilingId;
            existingProduct.StartPrijs = productUpdate.StartPrijs;
            existingProduct.EindPrijs = productUpdate.EindPrijs;

            try
            {
                // 4. Sla de wijzigingen op
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754// POST: api/ProductGegevens
        [Authorize(Roles = "VERKOPER,ADMIN")]
        [HttpPost]
        public async Task<ActionResult<ProductGegevens>> PostProductGegevens(ProductGegevensCreateUpdateDto productDto)
        {
            // 1. Map the DTO to the Entity
            var product = new ProductGegevens
            {
                ProductNaam = productDto.ProductNaam,
                ProductBeschrijving = productDto.ProductBeschrijving,
                Fotos = productDto.Fotos,
                Hoeveelheid = productDto.Hoeveelheid,
                EindPrijs = productDto.Eindprijs,
                VerkoperId = productDto.VerkoperId,
                LocatieId = productDto.LocatieId
                // Don't map SpecificatieIds here, they don't exist on the Product table
            };

            // 2. Save the Product first (This generates the ProductId)
            _context.ProductGegevens.Add(product);
            await _context.SaveChangesAsync(); 

            // 3. Now loop through the IDs and create the links in the Join Table
            if (productDto.SpecificatieIds != null && productDto.SpecificatieIds.Count > 0)
            {
                foreach (var specId in productDto.SpecificatieIds)
                {
                    var productSpecificatie = new ProductSpecificatie
                    {
                        ProductId = product.ProductId, // Use the ID created in Step 2
                        SpecificatieId = specId
                    };
            
                    _context.ProductSpecificaties.Add(productSpecificatie);
                }
        
                // 4. Save the links
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction("GetProductGegevens", new { id = product.ProductId }, product);
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
