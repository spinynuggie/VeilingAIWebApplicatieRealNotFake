using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Gegevens voor het registreren van een nieuw account.
    /// </summary>
    public class RegisterRequestDto
    {
        /// <summary>
        /// Het unieke e-mailadres van de gebruiker. Wordt gebruikt voor inloggen en communicatie.
        /// </summary>
        [Required(ErrorMessage = "E-mailadres is verplicht.")]
        [EmailAddress(ErrorMessage = "Ongeldig e-mailadres.")]
        public string Emailadres { get; set; }

        /// <summary>
        /// Het wachtwoord van de gebruiker. Wordt in de database opgeslagen als een veilige hash.
        /// </summary>
        [Required(ErrorMessage = "Wachtwoord is verplicht.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Wachtwoord moet minimaal 6 tekens lang zijn.")]
        public string Wachtwoord { get; set; }
    }
}