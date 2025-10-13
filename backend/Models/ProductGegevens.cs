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

        public string OverigeProductinformatie { get; set; }
    }
}