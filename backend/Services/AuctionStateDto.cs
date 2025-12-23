using System;

namespace backend.Services
{
    public sealed class AuctionStateDto
    {
        public int VeilingId { get; set; }
        public int? ActiveProductId { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal? LastBidPrice { get; set; }
        public int RemainingQuantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset ServerTime { get; set; }
        public DateTimeOffset Starttijd { get; set; }
        public DateTimeOffset Eindtijd { get; set; }

        public static AuctionStateDto FromState(AuctionVeilingState state, DateTimeOffset serverTime)
        {
            return new AuctionStateDto
            {
                VeilingId = state.VeilingId,
                ActiveProductId = state.ActiveProductId,
                CurrentPrice = state.CurrentPrice,
                LastBidPrice = state.LastBidPrice,
                RemainingQuantity = state.RemainingQuantity,
                Status = state.Status.ToWireValue(),
                ServerTime = serverTime,
                Starttijd = state.Starttijd,
                Eindtijd = state.Eindtijd
            };
        }
    }
}
