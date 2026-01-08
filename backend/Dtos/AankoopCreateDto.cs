// backend/Dtos/AankoopCreateDto.cs
namespace backend.Dtos
{
    public class AankoopCreateDto
    {
        public int ProductId { get; set; }
        
        // De client geeft aan tegen welke prijs en hoeveelheid ze willen kopen
        public decimal Prijs { get; set; }
        
        public int AanKoopHoeveelheid { get; set; }
    }
}