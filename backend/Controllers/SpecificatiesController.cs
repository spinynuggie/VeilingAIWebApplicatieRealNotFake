using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Dtos;
using backend.Models;
using backend.Data;

namespace backend.Controllers;

/// <summary>
/// Controller voor het beheren van de centrale lijst met productspecificaties.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SpecificatiesController : ControllerBase
{
    private readonly AppDbContext _context;



    public SpecificatiesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Maakt een nieuwe productspecificatie aan in de database.
    /// </summary>
    /// <param name="specificatieCreateDto">De gegevens voor de nieuwe specificatie (Naam en Beschrijving).</param>
    /// <returns>De aangemaakte specificatie-gegevens.</returns>
    /// <response code="201">Specificatie succesvol aangemaakt.</response>
    /// <response code="400">De data is ongeldig of de body is leeg.</response>
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
        

        return CreatedAtAction(nameof(CreateSpecificatie), specificatieCreateDto);
    }

    /// <summary>
    /// Haalt alle beschikbare specificaties op uit het systeem.
    /// </summary>
    /// <returns>Een lijst met specificaties in DTO-formaat.</returns>
    /// <response code="200">Lijst succesvol opgehaald.</response>
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