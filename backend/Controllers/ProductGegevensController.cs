using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos; // DTO's importeren
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; // Voor het ophalen van de GebruikerId

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

        // Helper: Mapping van Entiteit naar Response DTO
        private ProductGegevensResponseDto MapToResponseDto(ProductGegevens product)
        {
            return new ProductGegevensResponseDto
            {
                ProductId = product.ProductId,
                Fotos = product.Fotos,
                ProductNaam = product.ProductNaam,
                ProductBeschrijving = product.ProductBeschrijving,
                Hoeveelheid = product.Hoeveelheid,
                StartPrijs = product.StartPrijs,
                Huidigeprijs = product.Huidigeprijs,
                VeilingId = product.VeilingId,
                VerkoperId = product.VerkoperId
                // EindPrijs wordt niet ge-exposeerd
            };
        }

        // GET: api/ProductGegevens (GEBRUIKT DTO VOOR OUTPUT)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductGegevensResponseDto>>> GetProductGegevens()
        {
            var producten = await _context.ProductGegevens.ToListAsync();
            // Map ORM models to DTOs before returning
            return producten.Select(MapToResponseDto).ToList();
        }

        // GET: api/ProductGegevens/5 (GEBRUIKT DTO VOOR OUTPUT)
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductGegevensResponseDto>> GetProductGegevens(int id)
        {
            var productGegevens = await _context.ProductGegevens.FindAsync(id);

            if (productGegevens == null)
            {
                return NotFound();
            }

            // Stuur DTO terug
            return MapToResponseDto(productGegevens);
        }

        // PUT: api/ProductGegevens/5 (GEBRUIKT DTO VOOR INPUT)
        // Vereist AUTHORIZE om te zorgen dat alleen de verkoper dit kan wijzigen
        [HttpPut("{id}")]
        [Authorize] 
        public async Task<IActionResult> PutProductGegevens(int id, ProductGegevensCreateUpdateDto productDto)
        {
            var productGegevens = await _context.ProductGegevens.FindAsync(id);
            
            if (productGegevens == null)
            {
                return NotFound();
            }
            
            // SECURITY CHECK: Zorg ervoor dat de huidige gebruiker de verkoper is
            var verkoperIdClaim = User.FindFirst("VerkoperIdClaimType")?.Value;
            if (verkoperIdClaim == null || !int.TryParse(verkoperIdClaim, out int verkoperId) || productGegevens.VerkoperId != verkoperId)
            {
                 // Als de huidige gebruiker niet de eigenaar is, verbied de update
                 return Forbid();
            }

            // Map DTO naar Entiteit (alleen toegestane velden)
            productGegevens.Fotos = productDto.Fotos;
            productGegevens.ProductNaam = productDto.ProductNaam;
            productGegevens.ProductBeschrijving = productDto.ProductBeschrijving;
            productGegevens.Hoeveelheid = productDto.Hoeveelheid;
            productGegevens.StartPrijs = productDto.StartPrijs;
            // Opmerking: EindPrijs en Huidigeprijs worden NIET gemapt

            _context.Entry(productGegevens).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // AankoopExists check is niet meer nodig
                throw;
            }

            return NoContent();
        }

        // POST: api/ProductGegevens (GEBRUIKT DTO VOOR INPUT)
        [HttpPost]
        [Authorize] // Alleen ingelogde verkopers mogen producten aanmaken
        public async Task<ActionResult<ProductGegevensResponseDto>> PostProductGegevens(ProductGegevensCreateUpdateDto productDto)
        {
            // Haal de VerkoperId op uit de authenticatie claim (ESSENTIEEL)
            var verkoperIdClaim = User.FindFirst("VerkoperIdClaimType")?.Value;
            if (verkoperIdClaim == null || !int.TryParse(verkoperIdClaim, out int verkoperId))
            {
                return Unauthorized("U moet een geregistreerde verkoper zijn.");
            }
            
            // Converteer DTO naar Entiteit
            var productGegevens = new ProductGegevens
            {
                Fotos = productDto.Fotos,
                ProductNaam = productDto.ProductNaam,
                ProductBeschrijving = productDto.ProductBeschrijving,
                Hoeveelheid = productDto.Hoeveelheid,
                StartPrijs = productDto.StartPrijs,

                // INTERNE VELDEN INSTELLEN (Veiligheid!)
                Huidigeprijs = productDto.StartPrijs, // Startprijs is initiële huidige prijs
                EindPrijs = 0, // Wordt later ingesteld
                VerkoperId = verkoperId, // Afgeleid van de gebruiker
                VeilingId = 0 // Moet nog gekoppeld worden
            };

            _context.ProductGegevens.Add(productGegevens);
            await _context.SaveChangesAsync();

            // Retourneer DTO
            return CreatedAtAction("GetProductGegevens", new { id = productGegevens.ProductId }, MapToResponseDto(productGegevens));
        }

        // DELETE: api/ProductGegevens/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProductGegevens(int id)
        {
            var productGegevens = await _context.ProductGegevens.FindAsync(id);
            if (productGegevens == null)
            {
                return NotFound();
            }

            // Voeg hier een veiligheidscheck toe of de gebruiker de verkoper is!

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