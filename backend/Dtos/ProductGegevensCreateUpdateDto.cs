using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class ProductGegevensCreateUpdateDto
    {
        [Required]
        public string Fotos { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string ProductNaam { get; set; } = string.Empty;
        
        public string ProductBeschrijving { get; set; } = string.Empty;
        
        [Range(1, int.MaxValue)]
        public int Hoeveelheid { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal StartPrijs { get; set; }
        
    }
}