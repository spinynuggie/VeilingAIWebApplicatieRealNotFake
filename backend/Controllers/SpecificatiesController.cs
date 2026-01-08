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
    public async Task<ActionResult<SpecificatiesCreateDto>> CreateSpecificatie(
        [FromBody] SpecificatiesCreateDto specificatieCreateDto)
    {
        var specificatie = new Specificaties
        {
            Naam = specificatieCreateDto.naam,
            Beschrijving = specificatieCreateDto.beschrijving
        };

        _context.Specificaties.Add(specificatie);
        await _context.SaveChangesAsync();

        specificatieCreateDto.specificatieId = specificatie.SpecificatieId;

        return CreatedAtAction(nameof(CreateSpecificatie), specificatieCreateDto);
    }

    [HttpGet]
    public async Task<ActionResult<List<SpecificatiesResponseDto>>> GetSpecificaties()
    {
        var specificaties = await _context.Specificaties.ToListAsync();

        // Output validatie - filter en clean de data
        var response = specificaties
            .Where(s => s.SpecificatieId > 0 && 
                       !string.IsNullOrWhiteSpace(s.Naam))
            .Select(s => new SpecificatiesResponseDto
            {
                SpecificatieId = s.SpecificatieId,
                Naam = s.Naam?.Trim() ?? "",
                Beschrijving = string.IsNullOrWhiteSpace(s.Beschrijving) ? "" : s.Beschrijving.Trim()
            })
            .Take(100) // Limit voor performance
            .ToList();

        return Ok(response);
    }
}