using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Inloggegevens voor een bestaande gebruiker.
    /// </summary>
    public class LoginRequestDto
    {
        /// <summary>
        /// Het e-mailadres waarmee de gebruiker zich heeft geregistreerd.
        /// </summary>
        [Required(ErrorMessage = "E-mailadres is verplicht.")]
        [EmailAddress(ErrorMessage = "Ongeldig e-mailadres.")]
        public string Emailadres { get; set; }

        /// <summary>
        /// Het bijbehorende wachtwoord van het account.
        /// </summary>
        [Required(ErrorMessage = "Wachtwoord is verplicht.")]
        public string Wachtwoord { get; set; }
    }
}