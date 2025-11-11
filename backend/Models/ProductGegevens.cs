using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// Maakt een model aan voor Product Gegevens met de benodigde gegevens ervoor
    /// </summary>
    [Table("product_gegevens")]
    public class ProductGegevens
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductId { get; set; }

        public string Fotos { get; set; }

        public string ProductNaam { get; set; }

        public string ProductBeschrijving { get; set; }
        
        public int Hoeveelheid { get; set; }
        
        public decimal StartPrijs { get; set; }
        
        public decimal EindPrijs { get; set; }
        
        public decimal Huidigeprijs { get; set; }
        
        public int veilingId { get; set; }
        
        public int VerkoperId { get; set; }
    }
}