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
            public bool BidResultedInReset; // Flag for reset logic
            public DateTimeOffset CycleStartTime; // For accurate progress calculation per cycle
        }

        public class AuctionState
        {
            public int VeilingId;
            public List<ProductState> Products = new();
            public int CurrentIndex = 0;
            public bool IsPaused = false;
            
            // Global auction constraints
            public DateTimeOffset GlobalStartTime;
            public DateTimeOffset? GlobalEndTime;
            
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
            // Load products sequential order
            var products = await db.ProductGegevens
                .Where(p => p.VeilingId == id && !p.IsAfgehandeld) // Only load unfinished products!
                .OrderBy(p => p.ProductId) 
                .ToListAsync();

            if (veiling == null || !products.Any()) return null;

            var state = new AuctionState
            {
                VeilingId = id,
                GlobalStartTime = veiling.Starttijd,
                GlobalEndTime = veiling.Eindtijd
            };

            // Use Veiling duration setting
            double duration = veiling.VeilingDuurInSeconden;
            if (duration < 1) duration = 10;

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
                    CycleStartTime = DateTimeOffset.MaxValue,
                    DurationSeconds = duration // Use Veiling duration as the "slope" duration for each item
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
                product.CycleStartTime = DateTimeOffset.UtcNow;
                product.CurrentPrice = product.StartPrice;
                
                // Notify clients: Product Switching / Starting
                await _hubContext.Clients.Group(veilingId).SendAsync("ProductStart", new
                {
                    veilingId,
                    productId = product.ProductId,
                    productNaam = product.ProductNaam,
                    startPrice = product.StartPrice,
                    qty = product.RemainingQty,
                    timestamp = DateTimeOffset.UtcNow,
                    duration = product.DurationSeconds
                });

                // RUN PRODUCT TICK LOOP
                bool productSoldOut = false;

                while (!state.Cts.IsCancellationRequested)
                {
                    bool triggerCooldown = false;

                    lock (state.Lock)
                    {
                        if (product.RemainingQty <= 0)
                        {
                            productSoldOut = true;
                            break; // Sold out!
                        }
                        
                        if (product.BidResultedInReset)
                        {
                            product.BidResultedInReset = false;
                            triggerCooldown = true;
                        }
                        else
                        {
                            // Calculate Price based on cycle time
                            var elapsed = (DateTimeOffset.UtcNow - product.CycleStartTime).TotalSeconds;
                            var progress = Math.Clamp(elapsed / product.DurationSeconds, 0, 1);
                            
                            product.CurrentPrice = product.StartPrice - (decimal)(progress * (double)(product.StartPrice - product.EndPrice));
                            
                            // If we hit the end of the duration/price curve
                            if (progress >= 1.0)
                            {
                                break; // Timeup for this product
                            }
                        }
                    }

                    if (triggerCooldown)
                    {
                        // COOLDOWN LOGIC: Bid placed, pause then reset
                        state.IsPaused = true; // BLOCK BIDS
                        await _hubContext.Clients.Group(veilingId).SendAsync("AuctionPaused", new 
                        { 
                            veilingId, 
                            message = "Verkocht!", 
                            durationMs = 3000 
                        });

                        try { await Task.Delay(3000, state.Cts.Token); } 
                        catch (TaskCanceledException) { return; }

                        state.IsPaused = false; // UNBLOCK

                        // RESET: Price and Timer
                        lock (state.Lock) 
                        { 
                            product.CycleStartTime = DateTimeOffset.UtcNow;
                            product.CurrentPrice = product.StartPrice;
                            // Ensure flag is cleared if multiple bids slipped in before pause
                            product.BidResultedInReset = false; 
                        }
                        
                        // Broadcast ProductStart again so frontend resets its display
                        await _hubContext.Clients.Group(veilingId).SendAsync("ProductStart", new
                        {
                            veilingId,
                            productId = product.ProductId,
                            productNaam = product.ProductNaam,
                            startPrice = product.StartPrice,
                            qty = product.RemainingQty,
                            timestamp = DateTimeOffset.UtcNow,
                            duration = product.DurationSeconds
                        });
                        
                        continue; 
                    }

                    // Send Tick
                    await _hubContext.Clients.Group(veilingId).SendAsync("PriceTick", new
                    {
                        veilingId,
                        productId = product.ProductId, // Include ID so client knows
                        price = product.CurrentPrice,
                        timestamp = DateTimeOffset.UtcNow
                    });

                    try { await Task.Delay(100, state.Cts.Token); }
                    catch (TaskCanceledException) { return; }
                }

                if (state.Cts.IsCancellationRequested) return;

                // PRODUCT ENDED (Sold out or Time up)
                
                // Mark as handled in DB
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var dbProduct = await db.ProductGegevens.FindAsync(product.ProductId);
                        if (dbProduct != null)
                        {
                            dbProduct.IsAfgehandeld = true;
                            await db.SaveChangesAsync();
                        }
                    }
                    catch { /* Fire-and-forget */ }
                });

                // 3. PAUSE PHASE (Transition)
                state.IsPaused = true;
                await _hubContext.Clients.Group(veilingId).SendAsync("AuctionPaused", new
                {
                    veilingId,
                    message = productSoldOut ? "UITVERKOCHT!" : "Tijd is om!",
                    durationMs = 3000
                });

                try { await Task.Delay(3000, state.Cts.Token); }
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
                // STRICT MODE: If a reset is pending, no more bids allowed until next cycle.
                if (product.BidResultedInReset) return (false, "Product net verkocht, wacht op reset...");
                
                if (amount < product.EndPrice || amount > product.StartPrice) return (false, "Bod buiten limiet.");
                
                product.RemainingQty -= qty;
                product.BidResultedInReset = true; // Signal the loop to reset
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
