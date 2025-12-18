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

    [HttpGet]
    public asynt Task<ActionResult<SpecificatiesResponseDto>> GetSpecificatie()
    {
        return await _context.Specificatie.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<SpecificatiesCreateDto>> CreateSpecificatie(
        [FromBody] SpecificatiesCreateDto specificatieCreateDto)
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

    [HttpGet]
    public async Task<ActionResult<List<SpecificatiesResponseDto>>> GetSpecificaties()
    {
        var specificaties = await _context.Specificaties.ToListAsync();

        var response = specificaties.Select(s => new SpecificatiesResponseDto
        {
            SpecificatieId = s.SpecificatieId,
            Naam = s.Naam,
            Beschrijving = s.Beschrijving,
        }).ToList();

        return Ok(response);
    }
}