using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("gebruiker")]
    public class Gebruiker
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int GebruikerId { get; set; }

        [MaxLength(100)]
        public string? Naam { get; set; }

        [Required]
        [MaxLength(150)]
        public required string Emailadres { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Wachtwoord { get; set; }

        public string? Straat { get; set; }

        public string? Huisnummer { get; set; }

        public string? Postcode { get; set; }

        public string? Woonplaats { get; set; }
        [Column("role")]
        public string? Role { get; set; }
    }
}