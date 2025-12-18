using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;   

namespace backend.Models
{
    [Table("specificaties")]
    public class Specificatie
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SpecificatieId { get; set; }

        [Required]
        public string Naam { get; set; }

        [Required]
        public string Beschrijving { get; set; }
        
    }
}