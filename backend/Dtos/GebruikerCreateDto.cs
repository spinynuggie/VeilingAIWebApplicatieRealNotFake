using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    // Ontvangt data van de frontend voor registreren
    public class GebruikerCreateDto
    {
        public required string Emailadres { get; set; }

        public required string Wachtwoord { get; set; }
        
        public string? Naam { get; set; }
        
    }
}