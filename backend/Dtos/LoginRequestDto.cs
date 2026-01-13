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
        public string Emailadres { get; set; }

        /// <summary>
        /// Het bijbehorende wachtwoord van het account.
        /// </summary>
        public string Wachtwoord { get; set; }
    }
}