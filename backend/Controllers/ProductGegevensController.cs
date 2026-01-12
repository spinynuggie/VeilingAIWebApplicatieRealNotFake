using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos;

namespace backend.Controllers
{
    /// <summary>
    /// Beheert alle operaties met betrekking tot productgegevens, inclusief creatie, 
    /// wijziging, veilingkoppelingen en zoekopdrachten.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProductGegevensController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductGegevensController(AppDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// Maakt een nieuw product aan en koppelt de opgegeven specificaties.
        /// </summary>
        /// <param name="dto">De data voor het aanmaken van het product.</param>
        /// <returns>Het aangemaakte product met een succesbericht.</returns>
        /// <response code="201">Product succesvol aangemaakt.</response>
        /// <response code="401">Niet geautoriseerd.</response>
        /// <response code="403">Gebruiker heeft niet de juiste rol (Verkoper/Admin nodig).</response>
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
                StartPrijs = dto.Eindprijs + 2.00m,
                VerkoperId = dto.VerkoperId,
                LocatieId = dto.LocatieId,
                ProductSpecificaties = new List<ProductSpecificatie>() // Initialize
            };

            if (dto.SpecificatieIds != null)
            {
                foreach (var id in dto.SpecificatieIds)
                {
                    // Just add to the list, DON'T call SaveChanges yet
                    product.ProductSpecificaties.Add(new ProductSpecificatie { SpecificatieId = id });
                }
            }

            _context.ProductGegevens.Add(product);
    
            // This single call saves both the product AND its specs safely
            await _context.SaveChangesAsync(); 

            // Instead of returning the 'product' entity, return a simple status or a flat DTO
            return CreatedAtAction(nameof(GetProductGegevens), new { id = product.ProductId }, new { 
                product.ProductId, 
                product.ProductNaam, 
                Message = "Product successfully created" 
            });
        }
        /// <summary>
        /// Wijzigt de gegevens van een bestaand product.
        /// </summary>
        /// <param name="id">Het unieke ID van het product.</param>
        /// <param name="dto">De bijgewerkte productgegevens.</param>
        /// <returns>Geen inhoud bij succes.</returns>
        /// <response code="204">Wijziging succesvol doorgevoerd.</response>
        /// <response code="400">ID mismatch in de aanvraag.</response>
        /// <response code="404">Product niet gevonden.</response>
        [HttpPut("{id}")]
        [Authorize(Roles = "VERKOPER,ADMIN")]
        public async Task<IActionResult> PutProductGegevens(int id, ProductUpdateDto dto)
        {
            if (id != dto.ProductId) return BadRequest("ID mismatch");

            var product = await _context.ProductGegevens.Include(p => p.ProductSpecificaties)
                .FirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) return NotFound();

            product.ProductNaam = dto.ProductNaam;
            product.Fotos = dto.Fotos;
            product.ProductBeschrijving = dto.ProductBeschrijving;
            product.Hoeveelheid = dto.Hoeveelheid;
            product.StartPrijs = dto.StartPrijs;
            product.EindPrijs = dto.Eindprijs;
            product.LocatieId = dto.LocatieId;

            _context.ProductSpecificaties.RemoveRange(product.ProductSpecificaties);
            foreach (var specId in dto.SpecificatieIds)
            {
                _context.ProductSpecificaties.Add(new ProductSpecificatie { ProductId = id, SpecificatieId = specId });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        /// <summary>
        /// Koppelt een specifiek product aan een veiling en stelt de start- en eindprijzen in.
        /// </summary>
        /// <param name="id">Het ID van het product.</param>
        /// <param name="dto">De veilinggegevens.</param>
        /// <returns>Geen inhoud bij succes.</returns>
        /// <response code="204">Succesvol gekoppeld aan de veiling.</response>
        [HttpPatch("{id}/koppel-veiling")]
        [Authorize(Roles = "VEILINGMEESTER,ADMIN")]
        public async Task<IActionResult> KoppelAanVeiling(int id, ProductVeilingUpdateDto dto)
        {
            if (id != dto.ProductId) return BadRequest("Product ID mismatch");

            var product = await _context.ProductGegevens.FindAsync(id);
            if (product == null) return NotFound();

            // Update alleen de veiling-gerelateerde velden
            product.VeilingId = dto.VeilingId;
            product.StartPrijs = dto.StartPrijs;
            product.EindPrijs = dto.EindPrijs;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        /// <summary>
        /// Haalt alle producten op die toebehoren aan een specifieke verkoper.
        /// </summary>
        /// <param name="verkoperId">Het ID van de verkoper.</param>
        /// <returns>Een lijst van producten in DTO-formaat.</returns>
        [HttpGet("verkoper/{verkoperId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ProductGegevensResponseDto>>> GetProductsByVerkoper(int verkoperId)
        {
            var producten = await _context.ProductGegevens
                .Include(p => p.ProductSpecificaties)
                .ThenInclude(ps => ps.Specificatie)
                .Where(p => p.VerkoperId == verkoperId)
                .ToListAsync();

            // Map naar DTO's om de 500 error/cycles te voorkomen
            var response = producten.Select(product => new ProductGegevensResponseDto
            {
                ProductId = product.ProductId,
                Fotos = product.Fotos,
                ProductNaam = product.ProductNaam,
                ProductBeschrijving = product.ProductBeschrijving,
                Hoeveelheid = product.Hoeveelheid,
                StartPrijs = product.StartPrijs,
                EindPrijs = product.EindPrijs,
                Huidigeprijs = product.Huidigeprijs,
                VeilingId = product.VeilingId,
                VerkoperId = product.VerkoperId,
                Specificaties = product.ProductSpecificaties.Select(ps => new SpecificatiesResponseDto
                {
                    SpecificatieId = ps.SpecificatieId,
                    Naam = ps.Specificatie?.Naam ?? string.Empty,
                    Beschrijving = ps.Specificatie?.Beschrijving ?? string.Empty
                }).ToList()
            }).ToList();

            return Ok(response);
        }
        
        /// <summary>
        /// Haalt een lijst op van alle beschikbare producten.
        /// </summary>
        /// <returns>Een lijst van alle producten.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductGegevens>>> GetProductGegevens() =>
            await _context.ProductGegevens.ToListAsync();
        
        /// <summary>
        /// Haalt de details op van één specifiek product inclusief de bijbehorende specificaties.
        /// </summary>
        /// <param name="id">Het unieke ID van het product.</param>
        /// <returns>Gedetailleerde productgegevens in DTO-formaat.</returns>
        /// <response code="200">Product succesvol gevonden.</response>
        /// <response code="404">Product niet gevonden.</response>
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
                EindPrijs = product.EindPrijs,
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
