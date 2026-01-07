using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
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
    /// In-memory auction engine for high-performance, real-time price ticks and multiple sequential products.
    /// </summary>
    public sealed class AuctionRealtimeService
    {
        private readonly IHubContext<AuctionHub> _hubContext;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ConcurrentDictionary<string, AuctionState> _auctions = new();

        public class ProductState
        {
            public int ProductId;
            public string ProductNaam;
            public decimal StartPrice;
            public decimal EndPrice;
            public decimal CurrentPrice;
            public int OriginalQty;
            public int RemainingQty;
            public DateTimeOffset StartTime; // Effectively when this product became active
            public double DurationSeconds;    // Derived from Veiling duration
        }

        public class AuctionState
        {
            public int VeilingId;
            public List<ProductState> Products = new();
            public int CurrentIndex = 0;
            public bool IsPaused = false;
            
            // Global auction constraints
            public DateTimeOffset GlobalStartTime;
            public DateTimeOffset GlobalEndTime;
            
            public CancellationTokenSource Cts = new();
            public object Lock = new();

            public ProductState ActiveProduct => (CurrentIndex >= 0 && CurrentIndex < Products.Count) ? Products[CurrentIndex] : null;
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
            // Load ALL products for this auction
            var products = await db.ProductGegevens
                .Where(p => p.VeilingId == id)
                .OrderBy(p => p.ProductId) // Sequential order
                .ToListAsync();

            if (veiling == null || !products.Any()) return null;

            var totalDuration = (veiling.Eindtijd - veiling.Starttijd).TotalSeconds;
            if (totalDuration <= 0) totalDuration = 3600; // Fallback 1h

            var state = new AuctionState
            {
                VeilingId = id,
                GlobalStartTime = veiling.Starttijd,
                GlobalEndTime = veiling.Eindtijd
            };

            foreach (var p in products)
            {
                state.Products.Add(new ProductState
                {
                    ProductId = p.ProductId,
                    ProductNaam = p.ProductNaam,
                    StartPrice = p.StartPrijs,
                    EndPrice = p.EindPrijs,
                    CurrentPrice = p.StartPrijs,
                    OriginalQty = p.Hoeveelheid,
                    RemainingQty = p.Hoeveelheid,
                    // StartTime will be set when it becomes active
                    StartTime = DateTimeOffset.MaxValue, 
                    DurationSeconds = totalDuration // Use Veiling duration as the "slope" duration for each item
                });
            }

            // Attempt to add. If race condition beats us, use existing.
            if (_auctions.TryAdd(veilingId, state))
            {
                _ = RunAuctionLoopAsync(veilingId, state);
            }
            return _auctions[veilingId];
        }

        private async Task RunAuctionLoopAsync(string veilingId, AuctionState state)
        {
            // 1. Wait for Global Start Time
            var now = DateTimeOffset.UtcNow;
            if (state.GlobalStartTime > now)
            {
                try { await Task.Delay(state.GlobalStartTime - now, state.Cts.Token); }
                catch (TaskCanceledException) { return; }
            }

            // 2. Loop through products
            while (state.CurrentIndex < state.Products.Count && !state.Cts.IsCancellationRequested)
            {
                var product = state.ActiveProduct;
                if (product == null) break;

                // INIT PRODUCT
                product.StartTime = DateTimeOffset.UtcNow;
                
                // Notify clients: Product Switching / Starting
                await _hubContext.Clients.Group(veilingId).SendAsync("ProductStart", new
                {
                    veilingId,
                    productId = product.ProductId,
                    productNaam = product.ProductNaam,
                    startPrice = product.StartPrice,
                    qty = product.RemainingQty,
                    timestamp = DateTimeOffset.UtcNow
                });

                // RUN PRODUCT TICK LOOP
                bool productSoldOut = false;

                while (!state.Cts.IsCancellationRequested)
                {
                    // Calculate Price
                    var elapsed = (DateTimeOffset.UtcNow - product.StartTime).TotalSeconds;
                    var progress = Math.Clamp(elapsed / product.DurationSeconds, 0, 1);
                    
                    decimal newPrice = product.StartPrice - (decimal)(progress * (double)(product.StartPrice - product.EndPrice));

                    lock (state.Lock)
                    {
                        if (product.RemainingQty <= 0)
                        {
                            productSoldOut = true;
                            break; // Sold out!
                        }
                        
                        product.CurrentPrice = newPrice;
                        
                        // If we hit the end of the duration/price curve
                        if (progress >= 1.0)
                        {
                            break; // Timeup for this product
                        }
                    }

                    // Send Tick
                    await _hubContext.Clients.Group(veilingId).SendAsync("PriceTick", new
                    {
                        veilingId,
                        productId = product.ProductId, // Include ID so client knows
                        price = newPrice,
                        timestamp = DateTimeOffset.UtcNow
                    });

                    try { await Task.Delay(100, state.Cts.Token); }
                    catch (TaskCanceledException) { return; }
                }

                if (state.Cts.IsCancellationRequested) return;

                // PRODUCT ENDED (Sold out or Time up)
                
                // 3. PAUSE PHASE (5 Seconds)
                state.IsPaused = true;
                await _hubContext.Clients.Group(veilingId).SendAsync("AuctionPaused", new
                {
                    veilingId,
                    message = productSoldOut ? "UITVERKOCHT!" : "Tijd is om!",
                    durationMs = 5000
                });

                try { await Task.Delay(5000, state.Cts.Token); }
                catch (TaskCanceledException) { return; }
                
                state.IsPaused = false;

                // Move to next
                lock (state.Lock)
                {
                    state.CurrentIndex++;
                }
            }

            // AUCTION FINISHED
            await _hubContext.Clients.Group(veilingId).SendAsync("AuctionEnded", new { veilingId });
            _auctions.TryRemove(veilingId, out _);
        }

        public async Task<(bool success, string error)> ProcessBidAsync(string veilingId, int productId, decimal amount, int qty, int koperId, string bidder)
        {
            var state = GetState(veilingId);
            if (state == null) return (false, "Veiling niet actief.");
            
            if (state.IsPaused) return (false, "Veiling is gepauzeerd.");

            ProductState product;
            lock (state.Lock)
            {
                product = state.ActiveProduct;
                if (product == null) return (false, "Geen actief product.");
                if (product.ProductId != productId) return (false, "Dit product is niet meer actief.");
                
                if (product.RemainingQty < qty) return (false, "Onvoldoende voorraad.");
                if (amount < product.EndPrice || amount > product.StartPrice) return (false, "Bod buiten limiet.");
                
                product.RemainingQty -= qty;
            }

            // Persist async
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var dbProduct = await db.ProductGegevens.FindAsync(productId);
                if (dbProduct != null)
                {
                    dbProduct.Hoeveelheid = product.RemainingQty;
                    dbProduct.Huidigeprijs = product.CurrentPrice; 
                    
                    db.Aankoop.Add(new Aankoop
                    {
                        ProductId = productId,
                        GebruikerId = koperId,
                        Prijs = product.CurrentPrice, 
                        AanKoopHoeveelheid = qty,
                        IsBetaald = false,
                        Datum = DateTime.UtcNow
                    });
                    await db.SaveChangesAsync();
                }
            });

            await _hubContext.Clients.Group(veilingId).SendAsync("BidPlaced", new
            {
                veilingId,
                productId,
                amount = product.CurrentPrice, // Broadcast actual price dealt
                quantity = qty,
                bidder,
                remainingQuantity = product.RemainingQty,
                timestamp = DateTimeOffset.UtcNow
            });

            return (true, "");
        }
    }
}
