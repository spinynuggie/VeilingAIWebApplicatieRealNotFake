using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Gegevens voor het registreren van een nieuwe gebruiker in het systeem.
    /// </summary>
    public class GebruikerCreateDto
    {
        /// <summary>Het e-mailadres dat dient als unieke gebruikersnaam.</summary>
        public required string Emailadres { get; set; }

        /// <summary>Het wachtwoord (wordt server-side gehasht).</summary>
        public required string Wachtwoord { get; set; }

        /// <summary>De volledige naam of bedrijfsnaam van de gebruiker.</summary>
        public string? Naam { get; set; }
    }
}