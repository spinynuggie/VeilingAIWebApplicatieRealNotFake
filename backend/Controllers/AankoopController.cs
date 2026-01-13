using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos; 
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers
{
    /// <summary>
    /// Beheert de aankooptransacties van gebruikers. 
    /// Alle acties binnen deze controller vereisen een geautoriseerde gebruiker.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Alle Aankoop endpoints vereisen authenticatie
    public class AankoopController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AankoopController(AppDbContext context)
        {
            _context = context;
        }

        private AankoopResponseDto MapToResponseDto(Aankoop aankoop)
        {
            return new AankoopResponseDto
            {
                AankoopId = aankoop.AankoopId,
                ProductId = aankoop.ProductId,
                Prijs = aankoop.Prijs,
                AanKoopHoeveelheid = aankoop.AanKoopHoeveelheid,
                // Status mapping voor de frontend
                Status = aankoop.IsBetaald ? "Betaald" : "In Afwachting" 
            };
        }

        /// <summary>
        /// Haalt een lijst op van alle aankopen die zijn gedaan door de momenteel ingelogde gebruiker.
        /// </summary>
        /// <returns>Een lijst van aankopen in DTO-formaat.</returns>
        /// <response code="200">Lijst van aankopen succesvol opgehaald.</response>
        /// <response code="401">Gebruiker is niet geautoriseerd of ID niet gevonden in claims.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AankoopResponseDto>>> GetMijnAankopen()
        {
            // Haal de GebruikerId op uit de cookie claim (ESSENTIEEL voor privacy)
            var gebruikerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out int huidigeGebruikerId))
            {
                return Unauthorized("Gebruiker ID niet gevonden in token.");
            }

            var aankopen = await _context.Aankoop
                .Where(a => a.GebruikerId == huidigeGebruikerId)
                .ToListAsync();

            // Map naar DTO's voor veilige output
            return Ok(aankopen.Select(MapToResponseDto).ToList());
        }

        /// <summary>
        /// Haalt de details op van een specifieke aankoop, mits deze toebehoort aan de huidige gebruiker.
        /// </summary>
        /// <param name="id">Het unieke ID van de aankoop.</param>
        /// <returns>De gevraagde aankoopgegevens.</returns>
        /// <response code="200">Aankoop gevonden en geretourneerd.</response>
        /// <response code="401">Niet geautoriseerd.</response>
        /// <response code="404">Aankoop niet gevonden of niet eigendom van de gebruiker.</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<AankoopResponseDto>> GetAankoop(int id)
        {
            var gebruikerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out int huidigeGebruikerId))
            {
                return Unauthorized();
            }

            // Controleer of de aankoop bestaat EN toebehoort aan de huidige gebruiker
            var aankoop = await _context.Aankoop
                .FirstOrDefaultAsync(a => a.AankoopId == id && a.GebruikerId == huidigeGebruikerId);

            if (aankoop == null)
            {
                return NotFound();
            }

            // Map naar DTO voor veilige output
            return MapToResponseDto(aankoop);
        }

        /// <summary>
        /// Werkt een bestaande aankoop bij in de database.
        /// </summary>
        /// <param name="id">Het ID van de bij te werken aankoop.</param>
        /// <param name="aankoop">Het volledige aankoopobject met wijzigingen.</param>
        /// <returns>Geen inhoud bij succes.</returns>
        /// <response code="204">Succesvol bijgewerkt.</response>
        /// <response code="400">ID mismatch tussen URL en body.</response>
        /// <response code="404">Aankoop niet gevonden.</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAankoop(int id, AankoopUpdateDto updateDto)
        {
            var gebruikerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out int huidigeGebruikerId))
            {
                return Unauthorized();
            }

            var aankoop = await _context.Aankoop
                .FirstOrDefaultAsync(a => a.AankoopId == id && a.GebruikerId == huidigeGebruikerId);

            if (aankoop == null)
            {
                return NotFound("Aankoop niet gevonden of niet van u.");
            }

            // Alleen toegestane velden bijwerken
            aankoop.AanKoopHoeveelheid = updateDto.AanKoopHoeveelheid;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Registreert een nieuwe aankoop voor de momenteel ingelogde gebruiker.
        /// </summary>
        /// <param name="aankoopDto">De aankoopgegevens vanuit de client.</param>
        /// <returns>De nieuw aangemaakte aankoop inclusief gegenereerd ID.</returns>
        /// <response code="201">Aankoop succesvol aangemaakt.</response>
        /// <response code="401">Niet geautoriseerd om een aankoop te doen.</response>
        [HttpPost]
        public async Task<ActionResult<AankoopResponseDto>> PostAankoop(AankoopCreateDto aankoopDto)
        {
            // 1. Haal de GebruikerId op (veiligheid)
            var gebruikerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out int koperId))
            {
                return Unauthorized("U moet ingelogd zijn om een aankoop te doen.");
            }

            // 2. Converteer DTO naar Entiteit
            var aankoop = new Aankoop
            {
                ProductId = aankoopDto.ProductId,
                Prijs = aankoopDto.Prijs,
                AanKoopHoeveelheid = aankoopDto.AanKoopHoeveelheid,
                
                // Interne velden worden ingesteld door de backend, NIET de client DTO
                GebruikerId = koperId, 
                IsBetaald = false // Standaard onbetaald
            };

            _context.Aankoop.Add(aankoop);
            await _context.SaveChangesAsync();

            // 3. Retourneer de DTO
            return CreatedAtAction("GetAankoop", new { id = aankoop.AankoopId }, MapToResponseDto(aankoop));
        }


        /// <summary>
        /// Verwijdert een specifieke aankoop, mits deze toebehoort aan de huidige gebruiker.
        /// </summary>
        /// <param name="id">Het ID van de te verwijderen aankoop.</param>
        /// <response code="204">Succesvol verwijderd.</response>
        /// <response code="401">Niet geautoriseerd (niet ingelogd).</response>
        /// <response code="404">Aankoop niet gevonden of niet eigendom van de gebruiker.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAankoop(int id)
        {
            var gebruikerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out int huidigeGebruikerId))
            {
                return Unauthorized("Gebruiker ID niet gevonden in token.");
            }
            var aankoop = await _context.Aankoop
                .FirstOrDefaultAsync(a => a.AankoopId == id && a.GebruikerId == huidigeGebruikerId);
            
            if (aankoop == null)
            {
                return NotFound("Aankoop niet gevonden of u bent niet de eigenaar.");
            }

            _context.Aankoop.Remove(aankoop);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

