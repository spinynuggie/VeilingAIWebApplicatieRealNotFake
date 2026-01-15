using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// Maakt een model aan voor Verkoper Gegevens met de benodigde gegevens ervoor
    /// </summary>
    [Table("verkoper")]
    public class Verkoper
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VerkoperId { get; set; }

        [MaxLength(50)]
        public string KvkNummer { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Bedrijfsnaam { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Straat { get; set; } = string.Empty;

        [MaxLength(10)]
        public string Huisnummer { get; set; } = string.Empty;

        [MaxLength(10)]
        public string Postcode { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Woonplaats { get; set; } = string.Empty;

        public string FinancieleGegevens { get; set; } = string.Empty;

        // Link naar gebruiker zodat bedrijfsgegevens bij het account horen
        public int? GebruikerId { get; set; }
    }
}
