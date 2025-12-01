using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Data Transfer Object voor het aanmaken of bijwerken van Veiling gegevens.
    /// </summary>
    public class VeilingDto
    {
        [Required(ErrorMessage = "Naam is verplicht.")]
        [StringLength(100, ErrorMessage = "Naam mag maximaal 100 karakters bevatten.")]
        public string Naam { get; set; } = string.Empty;
        
        public string Beschrijving { get; set; } = string.Empty;
        
        public string Image { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Starttijd is verplicht.")]
        [Range(0, int.MaxValue, ErrorMessage = "Starttijd moet een positief getal zijn.")]
        public int Starttijd { get; set; }
        
        [Required(ErrorMessage = "Eindtijd is verplicht.")]
        [Range(0, int.MaxValue, ErrorMessage = "Eindtijd moet een positief getal zijn.")]
        public int Eindtijd { get; set; }

        [Required(ErrorMessage = "VeilingMeesterId is verplicht.")]
        public int VeilingMeesterId { get; set; }
    }
}