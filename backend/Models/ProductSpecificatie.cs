using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("product_specificaties")]
    public class ProductSpecificatie
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public virtual ProductGegevens Product { get; set; }

        public int SpecificatieId { get; set; }
        [ForeignKey("SpecificatieId")]
        public virtual Specificaties Specificatie { get; set; }
    }
}