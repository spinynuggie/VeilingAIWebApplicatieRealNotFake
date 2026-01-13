using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

/// <summary>
/// Gegevens voor het definiëren van een nieuw productkenmerk (stamgegevens).
/// </summary>
public class SpecificatiesCreateDto
{
    /// <summary>De naam van het kenmerk (bijv. "Kleur", "Lengte", "Versheid").</summary>
    [Required(ErrorMessage = "Naam is verplicht.")]
    public string naam { get; set; } = string.Empty;

    /// <summary>Een korte uitleg over wat dit kenmerk inhoudt.</summary>
    [Required(ErrorMessage = "Beschrijving is verplicht.")]
    public string beschrijving { get; set; } = string.Empty;
}