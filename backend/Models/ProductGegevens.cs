using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

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
        
        public int VeilingId { get; set; }
        
        public int VerkoperId { get; set; }
        
        public int LocatieId { get; set; }

        /// <summary>
        /// True when product is fully auctioned (sold out or time expired).
        /// </summary>
        public bool IsAfgehandeld { get; set; }

        // Navigation property voor meer op meer relatie
        public ICollection<ProductSpecificatie> ProductSpecificaties { get; set; }
    }
}