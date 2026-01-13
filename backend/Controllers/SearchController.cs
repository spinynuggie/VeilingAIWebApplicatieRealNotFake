using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Dtos;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    /// <summary>
    /// Controller voor het uitvoeren van zoekopdrachten binnen het gehele platform, inclusief producten, veilingen en specificaties.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Zoekt specifiek naar product-specificaties op basis van naam of beschrijving.
        /// </summary>
        /// <param name="query">De zoekterm voor de specificatie.</param>
        /// <returns>Een lijst met gevonden specificaties in DTO-formaat.</returns>
        /// <response code="200">Zoekopdracht geslaagd, resultaten geretourneerd.</response>
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

        /// <summary>
        /// Voert een algemene zoekopdracht uit over zowel Producten als Veilingen.
        /// </summary>
        /// <param name="query">De zoekterm (naam van product of veiling).</param>
        /// <returns>Een gecombineerde lijst van SearchResultDto's met vermelding van het type (Product/Veiling).</returns>
        /// <response code="200">Gecombineerde resultaten succesvol opgehaald.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SearchResultDto>>> Search([FromQuery] SearchQueryDto searchDto)
        {
            // Gebruik de DTO property i.p.v. een losse parameter
            if (string.IsNullOrWhiteSpace(searchDto.Query))
            {
                return Ok(new List<SearchResultDto>());
            }

            var searchTerm = searchDto.Query.ToLower().Trim();

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

            var results = products.Concat(auctions).ToList();
            return Ok(results);
        }
    }
}