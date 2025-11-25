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
        [MinLength(6, ErrorMessage = "Wachtwoord moet minimaal 6 tekens bevatten.")]
        [MaxLength(100)]
        public required string Wachtwoord { get; set; }
        
        [MaxLength(100)]
        public string? Naam { get; set; }
        
    }
}