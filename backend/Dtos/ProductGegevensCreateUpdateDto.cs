using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Dtos
{
    public class ProductCreateDto
    {
        [Required]
        public string Fotos { get; set; } = string.Empty;
        [Required, MaxLength(200)]
        public string ProductNaam { get; set; } = string.Empty;
        public string ProductBeschrijving { get; set; } = string.Empty;
        [Range(1, int.MaxValue)]
        public int Hoeveelheid { get; set; }
        [Range(0.01, double.MaxValue)]
        public decimal Eindprijs { get; set; }
        [Required]
        public int VerkoperId { get; set; }
        public int LocatieId { get; set; }
        public List<int> SpecificatieIds { get; set; } = new List<int>();
    }

    public class ProductUpdateDto : IValidatableObject
    {
        [Required]
        public int ProductId { get; set; }
        [Required]
        public string ProductNaam { get; set; } = string.Empty;
        public string Fotos { get; set; } = string.Empty;
        public string ProductBeschrijving { get; set; } = string.Empty;
        public int Hoeveelheid { get; set; }
        [Range(0.01, double.MaxValue)]
        public decimal StartPrijs { get; set; }
        [Range(0.01, double.MaxValue)]
        public decimal Eindprijs { get; set; }
        public int LocatieId { get; set; }
        public List<int> SpecificatieIds { get; set; } = new List<int>();

        // De logische check: Startprijs moet hoger zijn dan Eindprijs
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (Eindprijs > StartPrijs)
            {
                yield return new ValidationResult(
                    "De eindprijs mag niet hoger zijn dan de startprijs bij een afmijnveiling.",
                    new[] { nameof(Eindprijs) }
                );
            }
        }
    }
}