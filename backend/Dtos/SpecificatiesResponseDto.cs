namespace backend.Dtos;

/// <summary>
/// Gedetailleerde weergave van een productkenmerk, inclusief de bijbehorende ID.
/// </summary>
public class SpecificatiesResponseDto
{
    /// <summary>De unieke identifier van de specificatie.</summary>
    public int SpecificatieId { get; set; }

    /// <summary>De naam van het kenmerk (bijv. "Lente-actie", "Biologisch").</summary>
    public string Naam { get; set; } = string.Empty;

    /// <summary>Uitleg over de betekenis van dit kenmerk.</summary>
    public string Beschrijving { get; set; } = string.Empty;
}