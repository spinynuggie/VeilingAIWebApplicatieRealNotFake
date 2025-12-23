using System;
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

        [Required(ErrorMessage = "Locatie is verplicht.")]
        public string Locatie { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Starttijd is verplicht.")]
        public DateTimeOffset Starttijd { get; set; }
        
        [Required(ErrorMessage = "Eindtijd is verplicht.")]
        public DateTimeOffset Eindtijd { get; set; }

        [Required(ErrorMessage = "VeilingMeesterId is verplicht.")]
        public int VeilingMeesterId { get; set; }

        public int? ActiefProductId { get; set; }
    }
}
