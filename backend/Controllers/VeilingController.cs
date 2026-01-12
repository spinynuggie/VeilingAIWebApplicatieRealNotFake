using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos;

namespace backend.Controllers
{
    /// <summary>
    /// Controller voor het beheren van veilingen, inclusief planning en toewijzing van locaties en veilingmeesters.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class VeilingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VeilingController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Haalt een lijst op van alle geplande en actieve veilingen.
        /// </summary>
        /// <returns>Een lijst met veiling-objecten uit het domeinmodel.</returns>
        /// <response code="200">Lijst van veilingen succesvol opgehaald.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veiling>>> GetVeiling()
        {
            return await _context.Veiling.ToListAsync();
        }
        
        /// <summary>
        /// Haalt de details van een specifieke veiling op basis van het ID.
        /// </summary>
        /// <param name="id">Het unieke ID van de veiling.</param>
        /// <returns>Het gevraagde veiling-object.</returns>
        /// <response code="200">Veiling gevonden en geretourneerd.</response>
        /// <response code="404">Veiling met dit ID niet gevonden.</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<Veiling>> GetVeiling(int id)
        {
            var veiling = await _context.Veiling.FindAsync(id);

            if (veiling == null)
            {
                return NotFound();
            }

            return veiling;
        }
        
        /// <summary>
        /// Wijzigt een bestaande veiling. De velden worden bijgewerkt op basis van de meegegeven DTO.
        /// </summary>
        /// <param name="id">Het ID van de bij te werken veiling.</param>
        /// <param name="veilingDto">De nieuwe gegevens voor de veiling.</param>
        /// <returns>Geen inhoud bij succes.</returns>
        /// <response code="204">Veiling succesvol bijgewerkt.</response>
        /// <response code="404">Veiling niet gevonden.</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVeiling(int id, VeilingDto veilingDto)
        {
            // 1. Zoek het bestaande domeinmodel
            var veiling = await _context.Veiling.FindAsync(id);
            if (veiling == null)
            {
                return NotFound();
            }
            
            // 2. Map de DTO velden naar het bestaande domeinmodel
            veiling.Naam = veilingDto.Naam;
            veiling.Beschrijving = veilingDto.Beschrijving;
            veiling.Image = veilingDto.Image;
            veiling.Starttijd = veilingDto.Starttijd;
            veiling.Eindtijd   = veilingDto.Eindtijd;
            veiling.VeilingMeesterId = veilingDto.VeilingMeesterId;
            veiling.LocatieId = veilingDto.LocatieId;

            _context.Entry(veiling).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VeilingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// Creëert een nieuwe veiling in het systeem.
        /// </summary>
        /// <param name="veilingDto">De gegevens voor de nieuwe veiling.</param>
        /// <returns>De aangemaakte veiling inclusief het gegenereerde ID.</returns>
        /// <response code="201">Veiling succesvol aangemaakt.</response>
        [HttpPost]
        public async Task<ActionResult<Veiling>> PostVeiling(VeilingDto veilingDto)
        {
            // 1. Map de inkomende DTO naar een nieuw domeinmodel
            var veiling = new Veiling
            {
                Naam = veilingDto.Naam,
                Beschrijving = veilingDto.Beschrijving,
                Image = veilingDto.Image,
                Starttijd = veilingDto.Starttijd,
                Eindtijd   = veilingDto.Eindtijd,
                VeilingMeesterId = veilingDto.VeilingMeesterId,
                LocatieId = veilingDto.LocatieId
            };
            
            // 2. Voeg het domeinmodel toe en sla op
            _context.Veiling.Add(veiling);
            await _context.SaveChangesAsync();

            // 3. Retourneer het aangemaakte Veiling domeinmodel
            return CreatedAtAction("GetVeiling", new { id = veiling.VeilingId }, veiling);
        }

        /// <summary>
        /// Verwijdert een veiling definitief uit de database.
        /// </summary>
        /// <param name="id">Het ID van de te verwijderen veiling.</param>
        /// <returns>Geen inhoud bij succes.</returns>
        /// <response code="204">Veiling succesvol verwijderd.</response>
        /// <response code="404">Veiling niet gevonden.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiling(int id)
        {
            var veiling = await _context.Veiling.FindAsync(id);
            if (veiling == null)
            {
                return NotFound();
            }

            _context.Veiling.Remove(veiling);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VeilingExists(int id)
        {
            return _context.Veiling.Any(e => e.VeilingId == id);
        }
    }
}
