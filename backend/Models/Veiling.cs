using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{

    /// <summary>
    /// Maakt een model aan voor Veiling Gegevens met de benodigde gegevens ervoor
    /// </summary>
    [Table("veiling")]

    public class Veiling
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VeilingId { get; set; }
        
        [Required]
        public string Naam { get; set; } = string.Empty;
        
        public string Beschrijving { get; set; } = string.Empty;
        
        public string Image {get; set; } = string.Empty;
        
        public DateTimeOffset Starttijd { get; set; }
        
        public DateTimeOffset? Eindtijd { get; set; }

        /// <summary>
        /// De duur per productcyclus in seconden (1-30).
        /// </summary>
        [Required]
        [Range(1, 30)]
        public int VeilingDuurInSeconden { get; set; } = 10;

        public int VeilingMeesterId { get; set; }

        public int LocatieId { get; set; }
    }
}
