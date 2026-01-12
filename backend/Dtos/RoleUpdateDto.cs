using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Gegevens voor het wijzigen van de permissies van een gebruiker.
    /// </summary>
    public class RoleUpdateDto
    {
        /// <summary>
        /// De nieuwe rolnaam (bijv. "GEBRUIKER", "VERKOPER", "ADMIN"). 
        /// Bepaalt de toegangsniveaus binnen de applicatie.
        /// </summary>
        public required string Role { get; set; }
    }
}
