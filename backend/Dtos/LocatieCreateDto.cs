/// <summary>
/// Gegevens voor het aanmaken van een nieuwe veilinglocatie.
/// </summary>
public class LocatieCreateDto
{
    /// <summary>De unieke naam van de locatie (bijv. "Aalsmeer" of "Naaldwijk").</summary>
    public string LocatieNaam { get; set; } = string.Empty;
        
    /// <summary>Een URL-link naar een afbeelding van de locatie.</summary>
    public string Foto { get; set; } = string.Empty;
}