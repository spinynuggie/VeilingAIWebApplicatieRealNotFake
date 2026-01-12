// backend/Dtos/AankoopCreateDto.cs
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class AankoopCreateDto
    {
        public int ProductId { get; set; }
        public decimal Prijs { get; set; }
        public int AanKoopHoeveelheid { get; set; }
    }
}