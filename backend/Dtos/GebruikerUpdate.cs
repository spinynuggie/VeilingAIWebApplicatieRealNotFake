using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class GebruikerUpdateDto
    {
        [MaxLength(100)]
        public string? Naam { get; set; }
        
        [EmailAddress]
        [MaxLength(150)]
        public required string Emailadres { get; set; }

        public string? Straat { get; set; }
        public string? Huisnummer { get; set; }
        public string? Postcode { get; set; }
        public string? Woonplaats { get; set; }
    }
}