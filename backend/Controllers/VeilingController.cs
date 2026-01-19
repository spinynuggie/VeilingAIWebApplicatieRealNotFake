using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos;
using backend.Services;

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
        private readonly AuctionStarterService _auctionStarter;

        public VeilingController(AppDbContext context, AuctionStarterService auctionStarter)
        {
            _context = context;
            _auctionStarter = auctionStarter;
        }

        /// <summary>
        /// Haalt alle veilingen op uit de database.
        /// </summary>
        /// <returns>Een lijst met veiling-objecten uit het domeinmodel.</returns>
        /// <response code="200">Lijst van veilingen succesvol opgehaald.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetVeiling()
        {
            var veilingen = await _context.Veiling
                .Select(v => new
                {
                    v.VeilingId,
                    v.Naam,
                    v.Beschrijving,
                    v.Image,
                    v.Starttijd,
                    v.Eindtijd,
                    v.VeilingDuurInSeconden,
                    v.VeilingMeesterId,
                    v.LocatieId,
                    HasUnfinishedProducts = _context.ProductGegevens
                        .Any(p => p.VeilingId == v.VeilingId && !p.IsAfgehandeld && p.Hoeveelheid > 0)
                })
                .ToListAsync();

            return Ok(veilingen);
        }
        
        /// <summary>
        /// Haalt een specifieke veiling op basis van ID.
        /// </summary>
        /// <param name="id">Het ID van de veiling.</param>
        /// <returns>Het veiling-object als het gevonden is.</returns>
        /// <response code="200">Veiling gevonden.</response>
        /// <response code="404">Veiling niet gevonden.</response>
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
        /// Wijzigt een bestaande veiling.
        /// </summary>
        /// <param name="id">Het ID van de aan te passen veiling.</param>
        /// <param name="veilingDto">De nieuwe gegevens voor de veiling.</param>
        /// <returns>Geen inhoud als de wijziging succesvol was.</returns>
        /// <response code="204">Veiling succesvol gewijzigd.</response>
        /// <response code="400">ID in de URL komt niet overeen met ID in de body.</response>
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
            veiling.VeilingDuurInSeconden = veilingDto.VeilingDuurInSeconden;

            _context.Entry(veiling).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                
                // Reschedule in case start time changed
                _ = _auctionStarter.ScheduleAuctionIfNeeded(id);
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
        /// Voegt een nieuwe veiling toe aan de database.
        /// </summary>
        /// <param name="veilingDto">Het veiling-object dat toegevoegd moet worden.</param>
        /// <returns>Het aangemaakte veiling-object met de nieuwe ID.</returns>
        /// <response code="201">Veiling succesvol aangemaakt.</response>
        [HttpPost]
        public async Task<ActionResult<Veiling>> PostVeiling(VeilingDto veilingDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 1. Map de inkomende DTO naar een nieuw domeinmodel
            var veiling = new Veiling
            {
                Naam = veilingDto.Naam,
                Beschrijving = veilingDto.Beschrijving,
                Image = veilingDto.Image,
                Starttijd = veilingDto.Starttijd,
                Eindtijd   = veilingDto.Eindtijd,
                VeilingMeesterId = veilingDto.VeilingMeesterId,
                LocatieId = veilingDto.LocatieId,
                VeilingDuurInSeconden = veilingDto.VeilingDuurInSeconden
            };
            
            // 2. Voeg het domeinmodel toe en sla op
            _context.Veiling.Add(veiling);
            await _context.SaveChangesAsync();

            // 3. Schedule the auction to start at its start time
            _ = _auctionStarter.ScheduleAuctionIfNeeded(veiling.VeilingId);

            // 4. Retourneer het aangemaakte Veiling domeinmodel
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
