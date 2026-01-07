using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using backend.Data;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Services
{
    /// <summary>
    /// In-memory auction engine for high-performance, real-time price ticks and concurrency-safe bidding.
    /// </summary>
    public sealed class AuctionRealtimeService
    {
        private readonly IHubContext<AuctionHub> _hubContext;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ConcurrentDictionary<string, AuctionState> _auctions = new();

        public class AuctionState
        {
            public int VeilingId;
            public int ProductId;
            public decimal StartPrice;
            public decimal EndPrice;
            public decimal CurrentPrice;
            public int RemainingQty;
            public DateTimeOffset StartTime;
            public DateTimeOffset EndTime;
            public CancellationTokenSource Cts = new();
            public object Lock = new();
        }

        public AuctionRealtimeService(IHubContext<AuctionHub> hubContext, IServiceScopeFactory scopeFactory)
        {
            _hubContext = hubContext;
            _scopeFactory = scopeFactory;
        }

        public AuctionState? GetState(string veilingId) => _auctions.TryGetValue(veilingId, out var s) ? s : null;

        public async Task<AuctionState?> EnsureLoadedAsync(string veilingId)
        {
            if (_auctions.TryGetValue(veilingId, out var existing)) return existing;

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            if (!int.TryParse(veilingId, out var id)) return null;

            var veiling = await db.Veiling.FirstOrDefaultAsync(v => v.VeilingId == id);
            var product = await db.ProductGegevens.FirstOrDefaultAsync(p => p.VeilingId == id);
            if (veiling == null || product == null) return null;

            var state = new AuctionState
            {
                VeilingId = id,
                ProductId = product.ProductId,
                StartPrice = product.StartPrijs,
                EndPrice = product.EindPrijs,
                CurrentPrice = product.StartPrijs,
                RemainingQty = product.Hoeveelheid,
                StartTime = veiling.Starttijd,
                EndTime = veiling.Eindtijd
            };

            // Calculate current price based on absolute time
            var now = DateTimeOffset.UtcNow;
            if (now >= state.StartTime && now < state.EndTime)
            {
                var duration = (state.EndTime - state.StartTime).TotalSeconds;
                var elapsed = (now - state.StartTime).TotalSeconds;
                var progress = Math.Clamp(elapsed / duration, 0, 1);
                state.CurrentPrice = state.StartPrice - (decimal)(progress * (double)(state.StartPrice - state.EndPrice));
            }
            else if (now >= state.EndTime)
            {
                state.CurrentPrice = state.EndPrice;
            }

            if (_auctions.TryAdd(veilingId, state))
            {
                _ = RunTickLoopAsync(veilingId, state);
            }
            return _auctions[veilingId];
        }

        private async Task RunTickLoopAsync(string veilingId, AuctionState state)
        {
            // Wait until start time
            var now = DateTimeOffset.UtcNow;
            if (state.StartTime > now)
            {
                try { await Task.Delay(state.StartTime - now, state.Cts.Token); }
                catch (TaskCanceledException) { return; }
            }

            var duration = (state.EndTime - state.StartTime).TotalSeconds;
            while (DateTimeOffset.UtcNow < state.EndTime && !state.Cts.IsCancellationRequested && state.RemainingQty > 0)
            {
                var elapsed = (DateTimeOffset.UtcNow - state.StartTime).TotalSeconds;
                var progress = Math.Clamp(elapsed / duration, 0, 1);
                var price = state.StartPrice - (decimal)(progress * (double)(state.StartPrice - state.EndPrice));

                lock (state.Lock) { state.CurrentPrice = price; }

                await _hubContext.Clients.Group(veilingId).SendAsync(AuctionHub.PriceTickMethod, new
                {
                    veilingId,
                    price,
                    timestamp = DateTimeOffset.UtcNow
                });

                try { await Task.Delay(100, state.Cts.Token); }
                catch (TaskCanceledException) { break; }
            }
        }

        public async Task<(bool success, string error)> ProcessBidAsync(string veilingId, int productId, decimal amount, int qty, int koperId, string bidder)
        {
            var state = GetState(veilingId);
            if (state == null) return (false, "Veiling niet geladen.");

            lock (state.Lock)
            {
                if (state.RemainingQty < qty) return (false, "Onvoldoende voorraad.");
                if (amount < state.EndPrice || amount > state.StartPrice) return (false, "Bod buiten limiet.");
                state.RemainingQty -= qty;
            }

            // Persist async
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var product = await db.ProductGegevens.FindAsync(productId);
                if (product != null)
                {
                    product.Hoeveelheid = state.RemainingQty;
                    product.Huidigeprijs = amount;
                    db.Aankoop.Add(new Aankoop
                    {
                        ProductId = productId,
                        GebruikerId = koperId,
                        Prijs = amount,
                        AanKoopHoeveelheid = qty,
                        IsBetaald = false
                    });
                    await db.SaveChangesAsync();
                }
            });

            await _hubContext.Clients.Group(veilingId).SendAsync(AuctionHub.BidPlacedMethod, new
            {
                veilingId,
                productId,
                amount,
                quantity = qty,
                bidder,
                remainingQuantity = state.RemainingQty,
                timestamp = DateTimeOffset.UtcNow
            });

            if (state.RemainingQty <= 0) state.Cts.Cancel();
            return (true, "");
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
