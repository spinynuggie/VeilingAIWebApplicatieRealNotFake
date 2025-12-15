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
        var specificatie = new Specificaties
        {
            specificatieId = specificatieCreateDto.specificatieId,
            naam = specificatieCreateDto.naam,
            beschrijving = specificatieCreateDto.beschrijving
        };

        _context.Specificaties.Add(specificatie);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(CreateSpecificatie), specificatieCreateDto);
    }
}