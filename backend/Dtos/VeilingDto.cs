using System.Text.Json.Serialization;

namespace backend.Dtos
{
    /// <summary>
    /// Data Transfer Object voor het aanmaken van bijwerken van Veiling gegevens.
    /// </summary>
    public class VeilingDto
    {
        [JsonPropertyName("naam")]
        public string Naam { get; set; } = string.Empty;
        
        [JsonPropertyName("beschrijving")]
        public string Beschrijving { get; set; } = string.Empty;
        
        [JsonPropertyName("image")]
        public string Image { get; set; } = string.Empty;
        
        [JsonPropertyName("locatieId")]
        public int LocatieId { get; set; }

        [JsonPropertyName("starttijd")]
        public DateTimeOffset Starttijd { get; set; }
        
        [JsonPropertyName("eindtijd")]
        public DateTimeOffset Eindtijd { get; set; }

        [JsonPropertyName("veilingMeesterId")]
        public int VeilingMeesterId { get; set; }
    }
}
