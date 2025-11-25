// backend/Dtos/AankoopCreateDto.cs
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class AankoopCreateDto
    {
        [Required]
        public int ProductId { get; set; }
        
        // De client geeft aan tegen welke prijs en hoeveelheid ze willen kopen
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Prijs moet positief zijn.")]
        public decimal Prijs { get; set; }
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Hoeveelheid moet minstens 1 zijn.")]
        public int AanKoopHoeveelheid { get; set; }
    }
}