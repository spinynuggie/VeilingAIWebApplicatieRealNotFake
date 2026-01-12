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
        public string Naam { get; set; } = string.Empty;
        
        /// <summary>Beschrijving van de producten of het type veiling.</summary>
        [JsonPropertyName("beschrijving")]
        public string Beschrijving { get; set; } = string.Empty;
        
        /// <summary>URL van de omslagafbeelding voor de veiling.</summary>
        [JsonPropertyName("image")]
        public string Image { get; set; } = string.Empty;
        
        /// <summary>De ID van de fysieke locatie waar de veiling plaatsvindt.</summary>
        [JsonPropertyName("locatieId")]
        public int LocatieId { get; set; }
        
        /// <summary>Het exacte moment waarop de veilingklok begint.</summary>
        [JsonPropertyName("starttijd")]
        public DateTimeOffset Starttijd { get; set; }
        
        /// <summary>Het verwachte of uiterlijke eindmoment van de veiling.</summary>
        [JsonPropertyName("eindtijd")]
        public DateTimeOffset Eindtijd { get; set; }
        
        /// <summary>Het ID van de gebruiker die de rol van veilingmeester vervult.</summary>
        [JsonPropertyName("veilingMeesterId")]
        public int VeilingMeesterId { get; set; }
    }
}
