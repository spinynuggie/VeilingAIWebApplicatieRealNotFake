namespace backend.Dtos
{
    /// <summary>
    /// Generiek resultaat-object voor de zoekfunctionaliteit (Global Search).
    /// Kan verwijzen naar producten, veilingen of locaties.
    /// </summary>
    public class SearchResultDto
    {
        /// <summary>De unieke identifier van het gevonden item.</summary>
        public int Id { get; set; }

        /// <summary>De weergavenaam van het resultaat.</summary>
        public string Naam { get; set; } = string.Empty;

        /// <summary>De categorie van het resultaat (bijv. "Product", "Veiling", "Locatie").</summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>Optionele URL naar een thumbnail of profielfoto van het resultaat.</summary>
        public string? Image { get; set; } 
    }
}