namespace backend.Dtos
{
    public class ProductGegevensResponseDto
    {
        public int ProductId { get; set; }
        public string Fotos { get; set; } = string.Empty;
        public string ProductNaam { get; set; } = string.Empty;
        public string ProductBeschrijving { get; set; } = string.Empty;
        public int Hoeveelheid { get; set; } 
        public decimal StartPrijs { get; set; }
        public decimal Huidigeprijs { get; set; }
        public int VeilingId { get; set; }
        public int VerkoperId { get; set; }
        public List<SpecificatiesResponseDto> Specificaties { get; set; } = new();
    }
}