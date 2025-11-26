using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Data Transfer Object voor het aanmaken of bijwerken van Verkoper gegevens.
    /// </summary>
    public class VerkoperDto
    {
        [Required(ErrorMessage = "KvkNummer is verplicht.")]
        [StringLength(50, ErrorMessage = "KvkNummer mag maximaal 50 karakters bevatten.")]
        public string KvkNummer { get; set; } = string.Empty;

        public string Bedrijfsgegevens { get; set; } = string.Empty;

        public string Adresgegevens { get; set; } = string.Empty;

        public string FinancieleGegevens { get; set; } = string.Empty;
    }
}