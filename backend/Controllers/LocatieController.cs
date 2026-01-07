using backend.Models;
using backend.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")] // Dit resulteert in /api/Locatie
public class LocatieController : ControllerBase
{
    // Voorbeeld lijst voor demo doeleinden (normaal gebruik je een DBContext)
    private static readonly List<Locatie> _locaties = new();

    [HttpPost]
    public IActionResult CreateLocatie([FromBody] LocatieCreateDto dto)
    {
        if (dto == null)
        {
            return BadRequest("Data is ongeldig");
        }

        // Mapping van DTO naar Model
        var nieuweLocatie = new Locatie
        {
            LocatieId = _locaties.Count + 1, // Simpele ID generatie
            LocatieNaam = dto.LocatieNaam,
            Foto = dto.Foto
        };

        _locaties.Add(nieuweLocatie);

        // Retourneer 201 Created met het nieuwe object, inclusief ID
        return CreatedAtAction(nameof(GetLocaties), new { id = nieuweLocatie.LocatieId }, nieuweLocatie);
    }

    [HttpGet]
    public IActionResult GetLocaties()
    {
        return Ok(_locaties);
    }
}