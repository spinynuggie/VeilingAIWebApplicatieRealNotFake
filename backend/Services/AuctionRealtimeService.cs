using System;
using System.Threading.Tasks;
using backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace backend.Services
{
    /// <summary>
    /// Convenience service to push veiling events to connected clients without coupling controllers to Hub directly.
    /// </summary>
    public sealed class AuctionRealtimeService
    {
        private readonly IHubContext<AuctionHub> _hubContext;

        public AuctionRealtimeService(IHubContext<AuctionHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task PublishBidAsync(string veilingId, decimal amount, int quantity, string bidder, DateTimeOffset timestamp)
        {
            return _hubContext.Clients.Group(veilingId).SendAsync(AuctionHub.BidPlacedMethod, new
            {
                veilingId,
                amount,
                quantity,
                bidder,
                timestamp
            });
        }

        public Task PublishTickAsync(string veilingId, decimal price, DateTimeOffset timestamp)
        {
            return _hubContext.Clients.Group(veilingId).SendAsync(AuctionHub.PriceTickMethod, new
            {
                veilingId,
                price,
                timestamp
            });
        }
    }
}
