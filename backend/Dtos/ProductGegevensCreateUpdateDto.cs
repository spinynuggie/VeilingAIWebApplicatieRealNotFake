using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class ProductCreateDto
    {
        public string Fotos { get; set; } = string.Empty;
        public string ProductNaam { get; set; } = string.Empty;
        public string ProductBeschrijving { get; set; } = string.Empty;
        public int Hoeveelheid { get; set; }
        public decimal Eindprijs { get; set; }
        public int VerkoperId { get; set; }
        public int LocatieId { get; set; }
        public List<int> SpecificatieIds { get; set; } = new List<int>();
    }

    public class ProductUpdateDto
    {
        [Required]
        public int ProductId { get; set; }
        public string ProductNaam { get; set; } = string.Empty;
        public string Fotos { get; set; } = string.Empty;
        public string ProductBeschrijving { get; set; } = string.Empty;
        public int Hoeveelheid { get; set; }
        public decimal StartPrijs { get; set; }
        public decimal Eindprijs { get; set; }
        public int LocatieId { get; set; }
        public List<int> SpecificatieIds { get; set; } = new List<int>();

    }
}