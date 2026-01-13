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
        public string Emailadres { get; set; }

        /// <summary>
        /// Het wachtwoord van de gebruiker. Wordt in de database opgeslagen als een veilige hash.
        /// </summary>
        public string Wachtwoord { get; set; }
    }
}