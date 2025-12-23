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
    [Route("api/[controller]")]
    [ApiController]
    public class VeilingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuctionStateStore _stateStore;
        private readonly AuctionRealtimeService _realtime;

        public VeilingController(AppDbContext context, AuctionStateStore stateStore, AuctionRealtimeService realtime)
        {
            _context = context;
            _stateStore = stateStore;
            _realtime = realtime;
        }

        // GET: api/Veiling (Blijft ongewijzigd, retourneert het domeinmodel)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veiling>>> GetVeiling()
        {
            return await _context.Veiling.ToListAsync();
        }

        // GET: api/Veiling/5 (Blijft ongewijzigd, retourneert het domeinmodel)
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

        // PUT: api/Veiling/5 - GEBRUIKT DTO VOOR INPUT
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
            veiling.Locatie = veilingDto.Locatie;
            veiling.Starttijd = veilingDto.Starttijd;
            veiling.Eindtijd   = veilingDto.Eindtijd;
            veiling.VeilingMeesterId = veilingDto.VeilingMeesterId;
            if (veilingDto.ActiefProductId.HasValue)
            {
                veiling.ActiefProductId = veilingDto.ActiefProductId > 0 ? veilingDto.ActiefProductId : null;
            }

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

            await PublishAuctionStateAsync(veiling.VeilingId);

            return NoContent();
        }

        // POST: api/Veiling - GEBRUIKT DTO VOOR INPUT
        [HttpPost]
        public async Task<ActionResult<Veiling>> PostVeiling(VeilingDto veilingDto)
        {
            // 1. Map de inkomende DTO naar een nieuw domeinmodel
            var veiling = new Veiling
            {
                Naam = veilingDto.Naam,
                Beschrijving = veilingDto.Beschrijving,
                Image = veilingDto.Image,
                Locatie = veilingDto.Locatie,
                Starttijd = veilingDto.Starttijd,
                Eindtijd   = veilingDto.Eindtijd,
                VeilingMeesterId = veilingDto.VeilingMeesterId,
                ActiefProductId = veilingDto.ActiefProductId > 0 ? veilingDto.ActiefProductId : null
            };
            
            // 2. Voeg het domeinmodel toe en sla op
            _context.Veiling.Add(veiling);
            await _context.SaveChangesAsync();

            await PublishAuctionStateAsync(veiling.VeilingId);

            // 3. Retourneer het aangemaakte Veiling domeinmodel
            return CreatedAtAction("GetVeiling", new { id = veiling.VeilingId }, veiling);
        }

        // DELETE: api/Veiling/5 (Blijft ongewijzigd)
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

        private async Task PublishAuctionStateAsync(int veilingId)
        {
            var state = await _stateStore.GetOrRefreshAsync(_context, veilingId, true);
            if (state == null)
            {
                return;
            }

            var payload = AuctionStateDto.FromState(state, DateTimeOffset.UtcNow);
            await _realtime.PublishStateAsync(payload);
        }
    }
}
