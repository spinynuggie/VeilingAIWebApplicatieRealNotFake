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
        public string Naam { get; set; }
        
        public string Beschrijving { get; set; }
        
        public string Image {get; set; }
        
        public int Starttijd { get; set; }
        
        public int Eindtijd { get; set; }

        public int VeilingMeesterId { get; set; }

        public int ProductId { get; set; }
        
    }
}