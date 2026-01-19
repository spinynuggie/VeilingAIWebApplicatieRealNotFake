using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Dtos
{
    /// <summary>
    /// Gegevens voor het beheren van een veiling.
    /// </summary>
    public class VeilingDto
    {
        /// <summary>De publieke naam van de veiling.</summary>
        [JsonPropertyName("naam")]
        [Required(ErrorMessage = "Veilingnaam is verplicht.")]
        [StringLength(100, ErrorMessage = "Naam mag maximaal 100 tekens bevatten.")]
        public string Naam { get; set; } = string.Empty;
        
        /// <summary>Beschrijving van de producten of het type veiling.</summary>
        [JsonPropertyName("beschrijving")]
        [StringLength(2000, ErrorMessage = "Beschrijving mag maximaal 2000 tekens bevatten.")]
        public string Beschrijving { get; set; } = string.Empty;
        
        /// <summary>URL van de omslagafbeelding voor de veiling.</summary>
        [JsonPropertyName("image")]
        public string Image { get; set; } = string.Empty;
        
        /// <summary>De ID van de fysieke locatie waar de veiling plaatsvindt.</summary>
        [JsonPropertyName("locatieId")]
        [Required]
        public int LocatieId { get; set; }
        
        /// <summary>Het exacte moment waarop de veilingklok begint.</summary>
        [JsonPropertyName("starttijd")]
        [Required]
        public DateTimeOffset Starttijd { get; set; }
        
        /// <summary>Het verwachte of uiterlijke eindmoment van de veiling.</summary>
        [JsonPropertyName("eindtijd")]
        public DateTimeOffset? Eindtijd { get; set; }
        
        /// <summary>Het ID van de gebruiker die de rol van veilingmeester vervult.</summary>
        [JsonPropertyName("veilingMeesterId")]
        [Required]
        public int VeilingMeesterId { get; set; }
        
        /// <summary>De duur per productcyclus in seconden (1-30).</summary>
        [JsonPropertyName("veilingDuurInSeconden")]
        [Range(1, 30, ErrorMessage = "Veilingduur moet tussen 1 en 30 seconden zijn.")]
        public int VeilingDuurInSeconden { get; set; } = 10;
    }
}
