using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Gegevens voor het bijwerken van het profiel of adresgegevens van een gebruiker.
    /// </summary>
    public class GebruikerUpdateDto
    {
        /// <summary>De bijgewerkte naam van de gebruiker.</summary>
        [StringLength(100, ErrorMessage = "Naam mag maximaal 100 tekens bevatten.")]
        public string? Naam { get; set; }
        
        /// <summary>Het e-mailadres (kan gebruikt worden voor verificatie van de update).</summary>
        [Required(ErrorMessage = "E-mailadres is verplicht.")]
        [EmailAddress(ErrorMessage = "Ongeldig e-mailadres.")]
        public required string Emailadres { get; set; }

        /// <summary>De nieuwe straatnaam.</summary>
        public string? Straat { get; set; }

        /// <summary>Het nieuwe huisnummer.</summary>
        public string? Huisnummer { get; set; }

        /// <summary>De nieuwe postcode.</summary>
        public string? Postcode { get; set; }

        /// <summary>De nieuwe woonplaats.</summary>
        public string? Woonplaats { get; set; }
    }
}