namespace backend.Dtos
{
    /// <summary>
    /// Data Transfer Object voor het aanmaken of bijwerken van Verkoper gegevens.
    /// </summary>
    public class VerkoperDto
    {
        public string KvkNummer { get; set; } = string.Empty;
        public string Bedrijfsgegevens { get; set; } = string.Empty;
        public string Adresgegevens { get; set; } = string.Empty;
        public string FinancieleGegevens { get; set; } = string.Empty;

        // GebruikerId wordt server-side bepaald; client hoeft deze niet te sturen
    }
}
