using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

/// <summary>
/// Gegevens voor het definiëren van een nieuw productkenmerk (stamgegevens).
/// </summary>
public class SpecificatiesCreateDto
{
    /// <summary>Het unieke ID van de specificatie.</summary>
    public int specificatieId { get; set; }

    /// <summary>De naam van het kenmerk (bijv. "Kleur", "Lengte", "Versheid").</summary>
    public string naam { get; set; } = string.Empty;

    /// <summary>Een korte uitleg over wat dit kenmerk inhoudt.</summary>
    public string beschrijving { get; set; } = string.Empty;
}