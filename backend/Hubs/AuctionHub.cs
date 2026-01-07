using System;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    [Authorize]
    public sealed class AuctionHub : Hub
    {
        private readonly AppDbContext _context;
        private readonly AuctionRealtimeService _realtime;

        public AuctionHub(AppDbContext context, AuctionRealtimeService realtime)
        {
            _context = context;
            _realtime = realtime;
        }

        public const string BidPlacedMethod = "BidPlaced";
        public const string PriceTickMethod = "PriceTick";

        public async Task JoinAuction(string veilingId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, veilingId);

            // Load auction state and send current price immediately
            var state = await _realtime.EnsureLoadedAsync(veilingId);
            if (state != null)
            {
                await Clients.Caller.SendAsync(PriceTickMethod, new
                {
                    veilingId,
                    price = state.CurrentPrice,
                    timestamp = DateTimeOffset.UtcNow
                });
            }
        }

        public async Task LeaveAuction(string veilingId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, veilingId);
        }

        public async Task PlaceBid(string veilingId, int productId, decimal amount, int quantity = 1)
        {
            if (quantity <= 0) throw new HubException("Aantal moet groter zijn dan 0.");
            if (amount <= 0) throw new HubException("Bod moet groter zijn dan 0.");

            var gebruikerIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out var koperId))
                throw new HubException("Gebruiker niet gevonden.");

            var bidder = Context.UserIdentifier ?? Context.User?.Identity?.Name ?? "anonymous";

            var (success, error) = await _realtime.ProcessBidAsync(veilingId, productId, amount, quantity, koperId, bidder);
            if (!success) throw new HubException(error);
        }
    }
}

