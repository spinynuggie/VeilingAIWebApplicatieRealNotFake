using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Dtos
{
    /// <summary>
    /// Data Transfer Object voor het aanmaken of bijwerken van Veiling gegevens.
    /// </summary>
    public class VeilingDto
    {
        [Required(ErrorMessage = "Naam is verplicht.")]
        [StringLength(100, ErrorMessage = "Naam mag maximaal 100 karakters bevatten.")]
        [JsonPropertyName("naam")]
        public string Naam { get; set; } = string.Empty;
        
        [JsonPropertyName("beschrijving")]
        public string Beschrijving { get; set; } = string.Empty;
        
        [JsonPropertyName("image")]
        public string Image { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "LocatieId is verplicht.")]
        [JsonPropertyName("locatieId")]
        public int LocatieId { get; set; }

        [Required(ErrorMessage = "Starttijd is verplicht.")]
        [JsonPropertyName("starttijd")]
        public DateTimeOffset Starttijd { get; set; }
        
        [Required(ErrorMessage = "Eindtijd is verplicht.")]
        [JsonPropertyName("eindtijd")]
        public DateTimeOffset Eindtijd { get; set; }

        [Required(ErrorMessage = "VeilingMeesterId is verplicht.")]
        [JsonPropertyName("veilingMeesterId")]
        public int VeilingMeesterId { get; set; }
    }
}
