using System.ComponentModel.DataAnnotations;

/// <summary>
/// Gegevens voor het aanmaken van een nieuwe veilinglocatie.
/// </summary>
public class LocatieCreateDto
{
    /// <summary>De unieke naam van de locatie (bijv. "Aalsmeer" of "Naaldwijk").</summary>
    [Required(ErrorMessage = "Locatienaam is verplicht.")]
    [StringLength(60, ErrorMessage = "Locatienaam mag maximaal 60 tekens bevatten.")]
    public string LocatieNaam { get; set; } = string.Empty;
        
    /// <summary>Een URL-link naar een afbeelding van de locatie.</summary>
    [Required(ErrorMessage = "Foto URL is verplicht.")]
    public string Foto { get; set; } = string.Empty;
}