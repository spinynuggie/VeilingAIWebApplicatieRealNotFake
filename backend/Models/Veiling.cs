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
        public int Id { get; set; }
        
        [Required]
        public string Naam { get; set; }
        
        public int Starttijd { get; set; }
        
        public int Eindtijd { get; set; }
        
        public decimal Startprijs { get; set; }
        
        public decimal Huidigeprijs { get; set; }

        public int VeilingMeesterId { get; set; }

        public int ProductId { get; set; }
        
    }
}