namespace backend.Dtos
{
    /// <summary>
    /// De publieke informatie van een gebruiker zoals teruggestuurd naar de frontend.
    /// </summary>
    public class GebruikerResponseDto
    {
        /// <summary>Het unieke ID van de gebruiker.</summary>
        public int GebruikerId { get; set; }

        /// <summary>De naam van de gebruiker.</summary>
        public string? Naam { get; set; }

        /// <summary>Het e-mailadres voor contact en login.</summary>
        public required string Emailadres { get; set; }

        /// <summary>De straatnaam van het vestigingsadres.</summary>
        public string? Straat { get; set; }

        /// <summary>Het huisnummer inclusief eventuele toevoegingen.</summary>
        public string? Huisnummer { get; set; }

        /// <summary>De postcode (formaat: 1234AB).</summary>
        public string? Postcode { get; set; }

        /// <summary>De stad of woonplaats.</summary>
        public string? Woonplaats { get; set; }

        /// <summary>De toegewezen rol in het systeem (bijv. "GEBRUIKER", "VERKOPER", "ADMIN").</summary>
        public string? Role { get; set; }
    }
}
