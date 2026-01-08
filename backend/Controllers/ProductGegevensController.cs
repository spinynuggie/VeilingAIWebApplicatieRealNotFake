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

        [HttpPost]
        [Authorize(Roles = "VERKOPER,ADMIN")]
        public async Task<ActionResult<ProductGegevens>> PostProductGegevens(ProductCreateDto dto)
        {
            var product = new ProductGegevens
            {
                ProductNaam = dto.ProductNaam,
                ProductBeschrijving = dto.ProductBeschrijving,
                Fotos = dto.Fotos,
                Hoeveelheid = dto.Hoeveelheid,
                EindPrijs = dto.Eindprijs,
                StartPrijs = dto.Eindprijs, // Default waarde bij creatie
                VerkoperId = dto.VerkoperId,
                LocatieId = dto.LocatieId
            };

            _context.ProductGegevens.Add(product);
            await _context.SaveChangesAsync();

            if (dto.SpecificatieIds?.Count > 0)
            {
                foreach (var id in dto.SpecificatieIds)
                {
                    _context.ProductSpecificaties.Add(new ProductSpecificatie
                        { ProductId = product.ProductId, SpecificatieId = id });
                }

                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetProductGegevens), new { id = product.ProductId }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "VERKOPER,ADMIN")]
        public async Task<IActionResult> PutProductGegevens(int id, ProductVeilingUpdateDto dto)
        {
            if (id != dto.ProductId) return BadRequest("ID mismatch");

            var product = await _context.ProductGegevens.FindAsync(id);
            if (product == null) return NotFound();

            product.VeilingId = dto.VeilingId;
            product.StartPrijs = dto.StartPrijs;
            product.EindPrijs = dto.EindPrijs;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductGegevens>>> GetProductGegevens() =>
            await _context.ProductGegevens.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductGegevensResponseDto>> GetProductGegevens(int id)
        {
            var product = await _context.ProductGegevens
                .Include(p => p.ProductSpecificaties)
                .ThenInclude(ps => ps.Specificatie)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound();
            }

            var response = new ProductGegevensResponseDto
            {
                ProductId = product.ProductId,
                Fotos = product.Fotos,
                ProductNaam = product.ProductNaam,
                ProductBeschrijving = product.ProductBeschrijving,
                Hoeveelheid = product.Hoeveelheid,
                StartPrijs = product.StartPrijs,
                Huidigeprijs = product.Huidigeprijs,
                VeilingId = product.VeilingId,
                VerkoperId = product.VerkoperId,
                Specificaties = product.ProductSpecificaties.Select(ps => new SpecificatiesResponseDto
                {
                    SpecificatieId = ps.SpecificatieId,
                    Naam = ps.Specificatie?.Naam ?? string.Empty,
                    Beschrijving = ps.Specificatie?.Beschrijving ?? string.Empty
                }).ToList()
            };

            return Ok(response);
        }
    }
}
