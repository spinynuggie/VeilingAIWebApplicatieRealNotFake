using System;
using System.Collections.Generic;

namespace backend.Dtos
{
    public sealed class HistoricalPricePointDto
    {
        public decimal Prijs { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public sealed class HistoricalPriceResponseDto
    {
        public int ProductId { get; set; }
        public string ProductNaam { get; set; } = string.Empty;
        public int VerkoperId { get; set; }
        public decimal? AveragePrice { get; set; }
        public List<HistoricalPricePointDto> Last10CurrentSupplier { get; set; } = new();
        public List<HistoricalPricePointDto> Last10AllSuppliers { get; set; } = new();
    }
}
