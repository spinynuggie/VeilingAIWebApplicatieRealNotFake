using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Dtos; // Importeer de DTO namespace

namespace backend.Controllers
{
    /// <summary>
    /// Controller voor het beheren van veilingmeesters en hun koppeling aan gebruikersaccounts.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class VeilingMeesterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VeilingMeesterController(AppDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// Wijzigt een bestaande veilingmeester-koppeling.
        /// </summary>
        /// <param name="id">Het unieke MeesterId van de veilingmeester.</param>
        /// <param name="veilingMeesterDto">De DTO met het (nieuwe) GebruikerId.</param>
        /// <returns>Geen inhoud bij succes.</returns>
        /// <response code="204">Koppeling succesvol bijgewerkt.</response>
        /// <response code="404">Veilingmeester niet gevonden.</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVeilingMeester(int id, VeilingMeesterDto veilingMeesterDto)
        {
            var veilingMeester = await _context.VeilingMeesters.FindAsync(id);
            
            if (veilingMeester == null)
            {
                return NotFound();
            }

            // Map de DTO naar het bestaande domeinmodel
            veilingMeester.GebruikerId = veilingMeesterDto.GebruikerId;

            _context.Entry(veilingMeester).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VeilingMeesterExists(id))
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
        /// Promoveert een gebruiker naar de rol van Veilingmeester.
        /// </summary>
        /// <param name="veilingMeesterDto">De gegevens die nodig zijn om de koppeling te maken.</param>
        /// <returns>De aangemaakte Veilingmeester-entiteit inclusief MeesterId.</returns>
        /// <response code="201">Gebruiker succesvol gepromoveerd tot veilingmeester.</response>
        [HttpPost]
        public async Task<ActionResult<VeilingMeester>> PostVeilingMeester(VeilingMeesterDto veilingMeesterDto)
        {
            // Map de DTO naar een nieuw domeinmodel. MeesterId wordt automatisch gegenereerd.
            var veilingMeester = new VeilingMeester
            {
                GebruikerId = veilingMeesterDto.GebruikerId
            };

            _context.VeilingMeesters.Add(veilingMeester);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVeilingMeester", new { id = veilingMeester.MeesterId }, veilingMeester);
        }

        // ... DELETE en VeilingMeesterExists methoden blijven ongewijzigd ...

        /// <summary>
        /// Verwijdert de veilingmeester-status van een gebruiker.
        /// </summary>
        /// <param name="id">Het unieke MeesterId.</param>
        /// <returns>Geen inhoud bij succes.</returns>
        /// <response code="204">Veilingmeester succesvol verwijderd.</response>
        /// <response code="404">Veilingmeester niet gevonden.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeilingMeester(int id)
        {
            var veilingMeester = await _context.VeilingMeesters
                .FirstOrDefaultAsync(v => v.MeesterId == id);

            if (veilingMeester == null)
            {
                return NotFound("Veilingmeester niet gevonden.");
            }

            // LOGISCHE VALIDATIE:
            // Controleer of deze veilingmeester nog gekoppeld is aan actieve of geplande veilingen.
            var heeftActieveVeilingen = await _context.Veiling
                .AnyAsync(v => v.VeilingMeesterId == id && v.Eindtijd > DateTime.UtcNow);

            if (heeftActieveVeilingen)
            {
                return BadRequest("Kan veilingmeester niet verwijderen: deze persoon is nog gekoppeld aan actieve of toekomstige veilingen.");
            }

            _context.VeilingMeesters.Remove(veilingMeester);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VeilingMeesterExists(int id)
        {
            return _context.VeilingMeesters.Any(e => e.MeesterId == id);
        }
    }
}