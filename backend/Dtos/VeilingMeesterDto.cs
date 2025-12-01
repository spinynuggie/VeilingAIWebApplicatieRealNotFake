using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Data Transfer Object voor het aanmaken of bijwerken van VeilingMeester gegevens.
    /// Sluit de automatisch gegenereerde MeesterId uit.
    /// </summary>
    public class VeilingMeesterDto
    {
        [Required(ErrorMessage = "GebruikerId is verplicht.")]
        [Range(1, int.MaxValue, ErrorMessage = "GebruikerId moet een geldige positieve integer zijn.")]
        public int GebruikerId { get; set; }
    }
}