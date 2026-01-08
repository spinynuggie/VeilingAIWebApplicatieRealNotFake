using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<SpecificatiesResponseDto>>> SearchSpecificaties([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Ok(new List<SpecificatiesResponseDto>());
            }

            // We halen de data op en projecteren deze direct naar de DTO met .Select()
            var results = await _context.Specificaties
                .Where(s => s.Naam.Contains(query) || s.Beschrijving.Contains(query))
                .Select(s => new SpecificatiesResponseDto
                {
                    SpecificatieId = s.SpecificatieId,
                    Naam = s.Naam,
                    Beschrijving = s.Beschrijving
                })
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SearchResultDto>>> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Ok(new List<SearchResultDto>());
            }

            // 1. Clean the input: Lowercase and Trim spaces
            var searchTerm = query.ToLower().Trim();

            // 2. Search Products
            var products = await _context.ProductGegevens
                .Where(p => p.ProductNaam.ToLower().Contains(searchTerm)) 
                .Select(p => new SearchResultDto
                {
                    Id = p.ProductId,
                    Naam = p.ProductNaam,
                    Type = "Product",
                    Image = p.Fotos 
                })
                .ToListAsync();

            // 3. Search Auctions
            var auctions = await _context.Veiling
                .Where(v => v.Naam.ToLower().Contains(searchTerm))
                .Select(v => new SearchResultDto
                {
                    Id = v.VeilingId,
                    Naam = v.Naam,
                    Type = "Veiling",
                    Image = v.Image
                })
                .ToListAsync();

            // 4. Combine results
            var results = new List<SearchResultDto>();
            results.AddRange(products);
            results.AddRange(auctions);

            // 5. Output validatie - controleer data kwaliteit
            var validatedResults = results.Where(r => 
                !string.IsNullOrWhiteSpace(r.Naam) &&  // Naam mag niet leeg zijn
                r.Id > 0 &&                               // ID moet positief zijn
                !string.IsNullOrWhiteSpace(r.Type))      // Type mag niet leeg zijn
            .Select(r => new SearchResultDto              // Clean de output
            {
                Id = r.Id,
                Naam = r.Naam?.Trim() ?? "",              // Trim whitespace
                Type = r.Type?.Trim() ?? "Onbekend",      // Fallback voor type
                Image = string.IsNullOrWhiteSpace(r.Image) ? null : r.Image.Trim() // Clean image URL
            })
            .Take(50) // Limit results voor performance
            .ToList();

            return Ok(validatedResults);
        }
    }
}