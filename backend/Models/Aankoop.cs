using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("aankoop")]
    public class Aankoop
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AankoopId { get; set; }

        public int ProductId { get; set; }
        public int GebruikerId { get; set; }

        public decimal Prijs { get; set; }
        public int AanKoopHoeveelheid { get; set; }
        public bool IsBetaald { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    }
}
