using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    /// <summary>
    /// SignalR hub for real-time veiling (auction) updates.
    /// Clients join a veiling-specific group to receive bid/tick updates quickly.
    /// </summary>
    [Authorize]
    public sealed class AuctionHub : Hub
    {
        public const string BidPlacedMethod = "BidPlaced";
        public const string PriceTickMethod = "PriceTick";

        public async Task JoinAuction(string veilingId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, veilingId);
        }

        public async Task LeaveAuction(string veilingId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, veilingId);
        }

        /// <summary>
        /// Minimal bid endpoint; domain validation/persistence should live in a service.
        /// </summary>
        public async Task PlaceBid(string veilingId, decimal amount, int quantity = 1)
        {
            var bidder = Context.UserIdentifier ?? Context.User?.Identity?.Name ?? "anonymous";

            await Clients.Group(veilingId).SendAsync(BidPlacedMethod, new
            {
                veilingId,
                amount,
                quantity,
                bidder,
                timestamp = DateTimeOffset.UtcNow
            });
        }
    }
}
