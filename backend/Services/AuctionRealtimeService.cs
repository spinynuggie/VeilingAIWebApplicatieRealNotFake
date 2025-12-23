using System;
using System.Threading;
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

        public Task PublishTickAsync(AuctionStateDto state, CancellationToken cancellationToken = default)
        {
            return _hubContext.Clients
                .Group(state.VeilingId.ToString())
                .SendAsync(AuctionHub.PriceTickMethod, state, cancellationToken);
        }

        public Task PublishStateAsync(AuctionStateDto state, CancellationToken cancellationToken = default)
        {
            return _hubContext.Clients
                .Group(state.VeilingId.ToString())
                .SendAsync(AuctionHub.StateSyncMethod, state, cancellationToken);
        }
    }
}
