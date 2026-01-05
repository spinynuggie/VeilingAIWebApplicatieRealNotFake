using System;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
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

        public AuctionHub(AppDbContext context)
        {
            _context = context;
        }

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

            var product = await _context.ProductGegevens.FindAsync(productId);
            if (product == null || product.VeilingId != veilingInt)
            {
                throw new HubException("Product niet gevonden in deze veiling.");
            }

            if (product.Hoeveelheid < quantity)
            {
                throw new HubException("Onvoldoende voorraad voor dit aantal.");
            }

            if (product.StartPrijs > 0 && product.EindPrijs > 0 &&
                (amount < product.EindPrijs || amount > product.StartPrijs))
            {
                throw new HubException("Bod valt buiten de toegestane prijslimiet.");
            }

            product.Huidigeprijs = amount;
            product.Hoeveelheid -= quantity;

            var aankoop = new Aankoop
            {
                ProductId = productId,
                GebruikerId = koperId,
                Prijs = amount,
                AanKoopHoeveelheid = quantity,
                IsBetaald = false
            };

            _context.Aankoop.Add(aankoop);
            await _context.SaveChangesAsync();

            await Clients.Group(veilingId).SendAsync(BidPlacedMethod, new
            {
                veilingId,
                productId,
                amount,
                quantity,
                bidder,
                remainingQuantity = product.Hoeveelheid,
                timestamp = DateTimeOffset.UtcNow
            });
        }
    }
}
