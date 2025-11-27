using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    // Ontvangt data van de frontend voor registreren
    public class GebruikerCreateDto
    {
        [EmailAddress]
        [Required(ErrorMessage = "E-mailadres is verplicht.")]
        [MaxLength(150)]
        public required string Emailadres { get; set; }

        [Required(ErrorMessage = "Wachtwoord is verplicht.")]
        [MinLength(12, ErrorMessage = "Wachtwoord moet minimaal 12 tekens bevatten.")]
        [MaxLength(100)]
        public required string Wachtwoord { get; set; }
        
        [MaxLength(100)]
        public string? Naam { get; set; }
        
    }
}