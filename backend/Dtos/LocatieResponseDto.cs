/// <summary>
/// De representatie van een locatie zoals deze wordt getoond in de interface.
/// </summary>
public class LocatieResponseDto
{
    /// <summary>De naam van de locatie.</summary>
    public string LocatieNaam { get; set; } = string.Empty;
        
    /// <summary>De URL van de bijbehorende afbeelding.</summary>
    public string Foto { get; set; } = string.Empty;
}