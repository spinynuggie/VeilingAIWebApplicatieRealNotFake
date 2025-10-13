using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YourNamespace.Models
{
    /// <summary>
    /// Maakt een model aan voor Gebruiker met de benodigde gegevens ervoor
    /// </summary>
    [Table("gebruiker")]
    public class Gebruiker
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int GebruikerId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Naam { get; set; }

        [Required]
        [MaxLength(150)]
        public string Emailadres { get; set; }

        [MaxLength(100)]
        public string Straat { get; set; }

        [MaxLength(10)]
        public string Huisnummer { get; set; }

        [MaxLength(10)]
        public string Postcode { get; set; }

        [MaxLength(100)]
        public string Woonplaats { get; set; }
    }
}