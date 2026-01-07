using System;

namespace backend.Dtos
{
    public class VerkoperSalesDto
    {
        public int ProductId { get; set; }
        public string ProductNaam { get; set; } = string.Empty;
        public decimal Verkoopprijs { get; set; }
        public int Aantal { get; set; }
        public DateTimeOffset Datum { get; set; }
        public string KoperNaam { get; set; } = string.Empty; // Optional: Show who bought it
    }
}
