using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// Maakt een model aan voor Veiling Meester Gegevens met de benodigde gegevens ervoor
    /// </summary>
    [Table("veiling_meester")]
    public class VeilingMeester
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MeesterId { get; set; }

        [Required]
        public int GebruikerId { get; set; }

        [ForeignKey("GebruikerId")]
        public Gebruiker Gebruiker { get; set; }
    }
}