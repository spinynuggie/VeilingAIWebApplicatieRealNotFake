using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Dtos;
using backend.Models;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpecificatiesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SpecificatiesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<SpecificatiesCreateDto>> CreateSpecificatie([FromBody] SpecificatiesCreateDto specificatieCreateDto)
    {
        var specificatie = new Specificatie
        {
            Naam = specificatieCreateDto.naam,
            Beschrijving = specificatieCreateDto.beschrijving
        };

        _context.Specificaties.Add(specificatie);
        await _context.SaveChangesAsync();

        specificatieCreateDto.specificatieId = specificatie.SpecificatieId;

        return CreatedAtAction(nameof(CreateSpecificatie), specificatieCreateDto);
    }

    [HttpPost("link-to-product")]
    public async Task<ActionResult> LinkSpecificatieToProduct(int productId, int specificatieId)
    {
        var product = await _context.ProductGegevens.FindAsync(productId);
        var specificatie = await _context.Specificaties.FindAsync(specificatieId);

        if (product == null || specificatie == null)
        {
            return NotFound("Product of specificatie niet gevonden");
        }

        var existingLink = await _context.ProductSpecificaties
            .FirstOrDefaultAsync(ps => ps.ProductId == productId && ps.SpecificatieId == specificatieId);

        if (existingLink != null)
        {
            return BadRequest("Deze specificatie is al gekoppeld aan dit product");
        }

        var productSpecificatie = new ProductSpecificatie
        {
            ProductId = productId,
            SpecificatieId = specificatieId
        };

        _context.ProductSpecificaties.Add(productSpecificatie);
        await _context.SaveChangesAsync();

        return Ok("Specificatie succesvol gekoppeld aan product");
    }
}