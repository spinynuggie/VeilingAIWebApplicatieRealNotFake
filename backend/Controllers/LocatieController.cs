using backend.Data;
using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocatieController : ControllerBase
{
    private readonly AppDbContext _context;

    public LocatieController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Locatie>>> GetLocaties()
    {
        return await _context.Locaties.ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> CreateLocatie([FromBody] backend.Models.Locatie dto)
    {
        if (dto == null)
        {
            return BadRequest("Data is ongeldig");
        }

        _context.Locaties.Add(dto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLocaties), new { id = dto.LocatieId }, dto);
    }
}