using System;

namespace backend.Dtos
{
    public class VerkoopDto
    {
        public int ProductId { get; set; }
        public required string ProductNaam { get; set; }
        public decimal Verkoopprijs { get; set; }
        public int Aantal { get; set; }
        public DateTime Datum { get; set; }
        public required string KoperNaam { get; set; }
    }
}
