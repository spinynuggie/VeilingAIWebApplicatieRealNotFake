using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Dtos
{
    public class ProductGegevensCreateUpdateDto
    {
        [Required]
        [JsonPropertyName("fotos")]
        public string Fotos { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        [JsonPropertyName("productNaam")]
        public string ProductNaam { get; set; } = string.Empty;
        
        [JsonPropertyName("productBeschrijving")]
        public string ProductBeschrijving { get; set; } = string.Empty;
        
        [Range(1, int.MaxValue)]
        [JsonPropertyName("hoeveelheid")]
        public int Hoeveelheid { get; set; }
        
        [Range(0.01, double.MaxValue)]
        [JsonPropertyName("eindprijs")]
        public decimal Eindprijs { get; set; }

        [Required]
        [JsonPropertyName("verkoperId")]
        public int VerkoperId { get; set; }

        [JsonPropertyName("locatieId")]
        public int LocatieId { get; set; }

        [JsonPropertyName("specificatieIds")]
        public List<int> SpecificatieIds { get; set; } = new List<int>();
    }
}