using System;
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
        
        public DateTimeOffset Eindtijd { get; set; }

        public int? ActiefProductId { get; set; }

        public int VeilingMeesterId { get; set; }
        
        public string Locatie { get; set; } = string.Empty;
        
    }
}
