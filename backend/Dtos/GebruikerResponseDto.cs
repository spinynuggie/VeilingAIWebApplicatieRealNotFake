namespace backend.Dtos
{
    // wordt gebruikt voor get requests van de gebruiker in de frontend
    public class GebruikerResponseDto
    {
        public int GebruikerId { get; set; }
        public string? Naam { get; set; }
        public required string Emailadres { get; set; }
        public string? Straat { get; set; }
        public string? Huisnummer { get; set; }
        public string? Postcode { get; set; }
        public string? Woonplaats { get; set; }
        public string? Role { get; set; }
    }
}
