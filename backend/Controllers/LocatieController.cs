using backend.Models;
using backend.Dtos;
using backend.Data; // Zorg dat je de juiste namespace voor je DbContext hebt
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocatieController : ControllerBase
{
    private readonly AppDbContext _context;

    // Injecteer de DbContext via de constructor
    public LocatieController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLocaties()
    {
        // Haalt alle locaties op uit de PostgreSQL database
        var locaties = await _context.Locaties.ToListAsync();
        return Ok(locaties);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLocatie([FromBody] LocatieCreateDto dto)
    {
        if (dto == null) return BadRequest("Data is ongeldig");

        var nieuweLocatie = new Locatie
        {
            // Je hoeft hier GEEN ID te zetten, de DB (Postgres) doet dit automatisch
            LocatieNaam = dto.LocatieNaam,
            Foto = dto.Foto
        };

        _context.Locaties.Add(nieuweLocatie);
        await _context.SaveChangesAsync(); // Schrijft de data daadwerkelijk naar de DB

        return CreatedAtAction(nameof(GetLocaties), new { id = nieuweLocatie.LocatieId }, nieuweLocatie);
    }
}