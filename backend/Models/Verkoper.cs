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

        public string Bedrijfsgegevens { get; set; } = string.Empty;

        public string Adresgegevens { get; set; } = string.Empty;

        public string FinancieleGegevens { get; set; } = string.Empty;
    }
}
