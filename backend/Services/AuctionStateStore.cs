using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public enum AuctionStatus
    {
        NoActiveProduct,
        NotStarted,
        Live,
        Ended,
        SoldOut
    }

    public sealed class AuctionVeilingState
    {
        public int VeilingId { get; init; }
        public int? ActiveProductId { get; set; }
        public string? ActiveProductNaam { get; set; }
        public int? ActiveProductVerkoperId { get; set; }
        public decimal StartPrijs { get; set; }
        public decimal EindPrijs { get; set; }
        public int RemainingQuantity { get; set; }
        public decimal? LastBidPrice { get; set; }
        public decimal CurrentPrice { get; private set; }
        public DateTimeOffset Starttijd { get; set; }
        public DateTimeOffset Eindtijd { get; set; }
        public DateTimeOffset LastRefreshedUtc { get; set; }
        public AuctionStatus Status { get; private set; }

        public void Refresh(DateTimeOffset now)
        {
            if (ActiveProductId == null)
            {
                Status = AuctionStatus.NoActiveProduct;
                CurrentPrice = 0m;
                return;
            }

            if (RemainingQuantity <= 0)
            {
                Status = AuctionStatus.SoldOut;
                CurrentPrice = LastBidPrice ?? EindPrijs;
                return;
            }

            if (now < Starttijd)
            {
                Status = AuctionStatus.NotStarted;
                CurrentPrice = StartPrijs;
                return;
            }

            if (now >= Eindtijd)
            {
                Status = AuctionStatus.Ended;
                CurrentPrice = EindPrijs;
                return;
            }

            Status = AuctionStatus.Live;
            CurrentPrice = ComputePrice(now);
        }

        private decimal ComputePrice(DateTimeOffset now)
        {
            if (Eindtijd <= Starttijd)
            {
                return StartPrijs;
            }

            var totalMs = (Eindtijd - Starttijd).TotalMilliseconds;
            var elapsedMs = (now - Starttijd).TotalMilliseconds;
            var progress = Math.Clamp(elapsedMs / totalMs, 0d, 1d);
            var priceDelta = StartPrijs - EindPrijs;
            var rawPrice = StartPrijs - (decimal)progress * priceDelta;

            if (StartPrijs >= EindPrijs)
            {
                return Math.Max(EindPrijs, Math.Min(StartPrijs, rawPrice));
            }

            return Math.Min(EindPrijs, Math.Max(StartPrijs, rawPrice));
        }
    }

    public sealed class AuctionStateStore
    {
        private static readonly TimeSpan RefreshInterval = TimeSpan.FromSeconds(10);
        private readonly ConcurrentDictionary<int, AuctionVeilingState> _states = new();
        private readonly ConcurrentDictionary<int, SemaphoreSlim> _productLocks = new();

        public SemaphoreSlim GetProductLock(int productId)
        {
            return _productLocks.GetOrAdd(productId, _ => new SemaphoreSlim(1, 1));
        }

        public async Task<AuctionVeilingState?> GetOrRefreshAsync(
            AppDbContext context,
            int veilingId,
            bool forceRefresh,
            CancellationToken cancellationToken = default)
        {
            var now = DateTimeOffset.UtcNow;
            var state = _states.GetOrAdd(veilingId, _ => new AuctionVeilingState { VeilingId = veilingId });

            if (forceRefresh || now - state.LastRefreshedUtc > RefreshInterval)
            {
                var loaded = await LoadFromDatabaseAsync(context, veilingId, cancellationToken);
                if (loaded == null)
                {
                    _states.TryRemove(veilingId, out _);
                    return null;
                }

                state = loaded;
                _states[veilingId] = state;
            }

            state.Refresh(now);
            return state;
        }

        private static async Task<AuctionVeilingState?> LoadFromDatabaseAsync(
            AppDbContext context,
            int veilingId,
            CancellationToken cancellationToken)
        {
            var veiling = await context.Veiling
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.VeilingId == veilingId, cancellationToken);

            if (veiling == null)
            {
                return null;
            }

            ProductGegevens? product = null;
            if (veiling.ActiefProductId.HasValue)
            {
                product = await context.ProductGegevens
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        p => p.ProductId == veiling.ActiefProductId.Value && p.VeilingId == veilingId,
                        cancellationToken);
            }

            if (product == null)
            {
                product = await context.ProductGegevens
                    .AsNoTracking()
                    .Where(p => p.VeilingId == veilingId)
                    .OrderBy(p => p.VeilingVolgorde ?? int.MaxValue)
                    .ThenBy(p => p.ProductId)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            var state = new AuctionVeilingState
            {
                VeilingId = veilingId,
                ActiveProductId = product?.ProductId,
                ActiveProductNaam = product?.ProductNaam,
                ActiveProductVerkoperId = product?.VerkoperId,
                StartPrijs = product?.StartPrijs ?? 0m,
                EindPrijs = product?.EindPrijs ?? 0m,
                RemainingQuantity = product?.Hoeveelheid ?? 0,
                LastBidPrice = product != null && product.Huidigeprijs > 0 ? product.Huidigeprijs : null,
                Starttijd = veiling.Starttijd,
                Eindtijd = veiling.Eindtijd,
                LastRefreshedUtc = DateTimeOffset.UtcNow
            };

            state.Refresh(state.LastRefreshedUtc);
            return state;
        }
    }

    public static class AuctionStatusExtensions
    {
        public static string ToWireValue(this AuctionStatus status)
        {
            return status switch
            {
                AuctionStatus.NoActiveProduct => "no_active_product",
                AuctionStatus.NotStarted => "not_started",
                AuctionStatus.Live => "live",
                AuctionStatus.Ended => "ended",
                AuctionStatus.SoldOut => "sold_out",
                _ => "unknown"
            };
        }
    }
}
