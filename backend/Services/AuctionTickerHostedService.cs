using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace backend.Services
{
    public sealed class AuctionTickerHostedService : BackgroundService
    {
        private static readonly TimeSpan TickInterval = TimeSpan.FromMilliseconds(250);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly AuctionStateStore _stateStore;
        private readonly AuctionRealtimeService _realtime;
        private readonly AuctionPresenceStore _presence;

        public AuctionTickerHostedService(
            IServiceScopeFactory scopeFactory,
            AuctionStateStore stateStore,
            AuctionRealtimeService realtime,
            AuctionPresenceStore presence)
        {
            _scopeFactory = scopeFactory;
            _stateStore = stateStore;
            _realtime = realtime;
            _presence = presence;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(TickInterval);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    await TickAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // ignore shutdown
                }
                catch
                {
                    // ignore transient tick failures
                }
            }
        }

        private async Task TickAsync(CancellationToken cancellationToken)
        {
            var veilingIds = _presence.GetActiveVeilingIds();
            if (veilingIds.Count == 0)
            {
                return;
            }

            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var now = DateTimeOffset.UtcNow;

            foreach (var veilingId in veilingIds)
            {
                var state = await _stateStore.GetOrRefreshAsync(context, veilingId, false, cancellationToken);
                if (state == null || state.ActiveProductId == null)
                {
                    continue;
                }

                var payload = AuctionStateDto.FromState(state, now);
                await _realtime.PublishTickAsync(payload, cancellationToken);
            }
        }
    }
}
