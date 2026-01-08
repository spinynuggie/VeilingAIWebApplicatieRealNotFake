using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class GebruikerUpdateDto
    {
        public string? Naam { get; set; }
        
        public required string Emailadres { get; set; }

        public string? Straat { get; set; }
        public string? Huisnummer { get; set; }
        public string? Postcode { get; set; }
        public string? Woonplaats { get; set; }
    }
}