using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    /// <summary>
    /// Background service that schedules auctions to start at their exact start time.
    /// On startup, loads all upcoming auctions and schedules them with precise timers.
    /// </summary>
    public class AuctionStarterService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly AuctionRealtimeService _auctionService;
        private readonly ILogger<AuctionStarterService> _logger;
        
        // Track scheduled auctions to avoid duplicates
        private readonly ConcurrentDictionary<int, CancellationTokenSource> _scheduledAuctions = new();

        public AuctionStarterService(
            IServiceScopeFactory scopeFactory,
            AuctionRealtimeService auctionService,
            ILogger<AuctionStarterService> logger)
        {
            _scopeFactory = scopeFactory;
            _auctionService = auctionService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AuctionStarterService started. Scheduling auctions...");

            // Initial load
            await ScheduleAllAuctionsAsync(stoppingToken);

            // Periodic backup check
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
                await ScheduleAllAuctionsAsync(stoppingToken);
            }
        }

        /// <summary>
        /// Public method for VeilingController to call immediately when creating/updating an auction.
        /// </summary>
        public async Task ScheduleAuctionIfNeeded(int veilingId)
        {
            try
            {
                // Skip if already scheduled or running
                if (_scheduledAuctions.ContainsKey(veilingId))
                    return;

                if (_auctionService.GetState(veilingId.ToString()) != null)
                    return;

                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var auction = await db.Veiling
                    .Where(v => v.VeilingId == veilingId)
                    .Select(v => new
                    {
                        v.VeilingId,
                        v.Starttijd,
                        v.Eindtijd,
                        HasUnfinishedProducts = db.ProductGegevens
                            .Any(p => p.VeilingId == v.VeilingId && !p.IsAfgehandeld && p.Hoeveelheid > 0)
                    })
                    .FirstOrDefaultAsync();

                if (auction == null || !auction.HasUnfinishedProducts)
                    return;

                var now = DateTimeOffset.UtcNow;
                if (auction.Eindtijd.HasValue && auction.Eindtijd.Value <= now)
                    return; // Already ended

                var delay = auction.Starttijd - now;

                if (delay <= TimeSpan.Zero)
                {
                    _logger.LogInformation("Starting auction {VeilingId} immediately", veilingId);
                    _ = StartAuctionAsync(veilingId);
                }
                else
                {
                    _logger.LogInformation("Scheduling auction {VeilingId} to start in {Delay}", veilingId, delay);
                    ScheduleAuction(veilingId, delay, CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling auction {VeilingId}", veilingId);
            }
        }

        private async Task ScheduleAllAuctionsAsync(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var now = DateTimeOffset.UtcNow;

                var auctions = await db.Veiling
                    .Where(v => !v.Eindtijd.HasValue || v.Eindtijd.Value > now)
                    .Select(v => new
                    {
                        v.VeilingId,
                        v.Starttijd,
                        HasUnfinishedProducts = db.ProductGegevens
                            .Any(p => p.VeilingId == v.VeilingId && !p.IsAfgehandeld && p.Hoeveelheid > 0)
                    })
                    .Where(v => v.HasUnfinishedProducts)
                    .ToListAsync(stoppingToken);

                foreach (var auction in auctions)
                {
                    if (_scheduledAuctions.ContainsKey(auction.VeilingId))
                        continue;
                    if (_auctionService.GetState(auction.VeilingId.ToString()) != null)
                        continue;

                    var delay = auction.Starttijd - now;

                    if (delay <= TimeSpan.Zero)
                    {
                        _logger.LogInformation("Starting auction {VeilingId} immediately (past start time)", auction.VeilingId);
                        _ = StartAuctionAsync(auction.VeilingId);
                    }
                    else
                    {
                        _logger.LogInformation("Scheduling auction {VeilingId} to start in {Delay}", auction.VeilingId, delay);
                        ScheduleAuction(auction.VeilingId, delay, stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling auctions");
            }
        }

        private void ScheduleAuction(int veilingId, TimeSpan delay, CancellationToken stoppingToken)
        {
            var cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
            
            if (!_scheduledAuctions.TryAdd(veilingId, cts))
                return; 

            _ = Task.Run(async () =>
            {
                try
                {
                    await Task.Delay(delay, cts.Token);
                    
                    if (!cts.Token.IsCancellationRequested)
                    {
                        await StartAuctionAsync(veilingId);
                    }
                }
                catch (TaskCanceledException) { }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in scheduled auction start for {VeilingId}", veilingId);
                }
                finally
                {
                    _scheduledAuctions.TryRemove(veilingId, out _);
                }
            }, stoppingToken);
        }

        private async Task StartAuctionAsync(int veilingId)
        {
            _logger.LogInformation("Auto-starting auction {VeilingId}", veilingId);
            await _auctionService.EnsureLoadedAsync(veilingId.ToString());
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            foreach (var cts in _scheduledAuctions.Values) cts.Cancel();
            _scheduledAuctions.Clear();
            return base.StopAsync(cancellationToken);
        }
    }
}
