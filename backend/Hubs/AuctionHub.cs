using System;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Services;
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
        private readonly AppDbContext _context;
        private readonly AuctionStateStore _stateStore;
        private readonly AuctionPresenceStore _presence;

        public AuctionHub(AppDbContext context, AuctionStateStore stateStore, AuctionPresenceStore presence)
        {
            _context = context;
            _stateStore = stateStore;
            _presence = presence;
        }

        public const string BidPlacedMethod = "BidPlaced";
        public const string PriceTickMethod = "PriceTick";
        public const string StateSyncMethod = "AuctionState";

        public async Task JoinAuction(string veilingId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, veilingId);

            if (int.TryParse(veilingId, out var veilingInt))
            {
                _presence.AddConnection(Context.ConnectionId, veilingInt);
                var state = await _stateStore.GetOrRefreshAsync(_context, veilingInt, true);
                if (state != null)
                {
                    var payload = AuctionStateDto.FromState(state, DateTimeOffset.UtcNow);
                    await Clients.Caller.SendAsync(StateSyncMethod, payload);
                }
            }
        }

        public async Task LeaveAuction(string veilingId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, veilingId);
            if (int.TryParse(veilingId, out var veilingInt))
            {
                _presence.RemoveConnection(Context.ConnectionId, veilingInt);
            }
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            _presence.RemoveConnection(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }

        public async Task<AuctionStateDto> GetCurrentState(string veilingId)
        {
            if (!int.TryParse(veilingId, out var veilingInt))
            {
                throw new HubException("Ongeldige veiling.");
            }

            var state = await _stateStore.GetOrRefreshAsync(_context, veilingInt, true);
            if (state == null)
            {
                throw new HubException("Veiling niet gevonden.");
            }

            return AuctionStateDto.FromState(state, DateTimeOffset.UtcNow);
        }

        /// <summary>
        /// Bid endpoint; persists the purchase and broadcasts to the veiling group.
        /// </summary>
        public async Task PlaceBid(string veilingId, int productId, decimal amount, int quantity = 1)
        {
            if (quantity <= 0)
            {
                throw new HubException("Aantal moet groter zijn dan 0.");
            }

            if (amount <= 0)
            {
                throw new HubException("Bod moet groter zijn dan 0.");
            }

            var bidder = Context.UserIdentifier ?? Context.User?.Identity?.Name ?? "anonymous";
            var gebruikerIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (gebruikerIdClaim == null || !int.TryParse(gebruikerIdClaim, out var koperId))
            {
                throw new HubException("Gebruiker niet gevonden.");
            }

            if (!int.TryParse(veilingId, out var veilingInt))
            {
                throw new HubException("Ongeldige veiling.");
            }

            var state = await _stateStore.GetOrRefreshAsync(_context, veilingInt, true);
            if (state == null)
            {
                throw new HubException("Veiling niet gevonden.");
            }

            if (state.ActiveProductId == null)
            {
                throw new HubException("Er is geen actief product in deze veiling.");
            }

            if (state.ActiveProductId != productId)
            {
                throw new HubException("Dit product is momenteel niet actief.");
            }

            var productLock = _stateStore.GetProductLock(productId);
            await productLock.WaitAsync();
            try
            {
                var now = DateTimeOffset.UtcNow;
                state.Refresh(now);

                if (state.Status != AuctionStatus.Live)
                {
                    throw new HubException("De veiling is niet actief.");
                }

                if (state.RemainingQuantity < quantity)
                {
                    throw new HubException("Onvoldoende voorraad voor dit aantal.");
                }

                var currentPrice = state.CurrentPrice;
                if (amount + 0.01m < currentPrice)
                {
                    throw new HubException("Bod is te laag voor de huidige prijs.");
                }

                var product = await _context.ProductGegevens.FindAsync(productId);
                if (product == null || product.VeilingId != veilingInt)
                {
                    throw new HubException("Product niet gevonden in deze veiling.");
                }

                if (product.Hoeveelheid < quantity)
                {
                    throw new HubException("Onvoldoende voorraad voor dit aantal.");
                }

                var previousRemaining = state.RemainingQuantity;
                var previousLastBid = state.LastBidPrice;

                state.RemainingQuantity -= quantity;
                state.LastBidPrice = currentPrice;
                state.Refresh(now);

                product.Huidigeprijs = currentPrice;
                product.Hoeveelheid -= quantity;

                var aankoop = new Aankoop
                {
                    ProductId = productId,
                    GebruikerId = koperId,
                    Prijs = currentPrice,
                    AanKoopHoeveelheid = quantity,
                    IsBetaald = false,
                    CreatedAt = now
                };

                _context.Aankoop.Add(aankoop);

                await Clients.Group(veilingId).SendAsync(BidPlacedMethod, new
                {
                    veilingId,
                    productId,
                    amount = currentPrice,
                    quantity,
                    bidder,
                    remainingQuantity = state.RemainingQuantity,
                    status = state.Status.ToWireValue(),
                    timestamp = now
                });

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch
                {
                    state.RemainingQuantity = previousRemaining;
                    state.LastBidPrice = previousLastBid;
                    state.Refresh(DateTimeOffset.UtcNow);

                    var correction = AuctionStateDto.FromState(state, DateTimeOffset.UtcNow);
                    await Clients.Group(veilingId).SendAsync(StateSyncMethod, correction);

                    throw new HubException("Bod kon niet worden opgeslagen. Probeer opnieuw.");
                }
            }
            finally
            {
                productLock.Release();
            }
        }
    }
}
