using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Dtos
{
    public class ProductGegevensCreateUpdateDto
    {
        [JsonPropertyName("fotos")]
        public string Fotos { get; set; } = string.Empty;
        
        [JsonPropertyName("productNaam")]
        public string ProductNaam { get; set; } = string.Empty;
        
        [JsonPropertyName("productBeschrijving")]
        public string ProductBeschrijving { get; set; } = string.Empty;
        
        [JsonPropertyName("hoeveelheid")]
        public int Hoeveelheid { get; set; }
        
        [JsonPropertyName("startPrijs")]
        public decimal StartPrijs { get; set; }
        
        [JsonPropertyName("eindprijs")]
        public decimal Eindprijs { get; set; }

        [JsonPropertyName("verkoperId")]
        public int VerkoperId { get; set; }

        [JsonPropertyName("locatieId")]
        public int LocatieId { get; set; }

        [JsonPropertyName("specificatieIds")]
        public List<int> SpecificatieIds { get; set; } = new List<int>();
    }
}