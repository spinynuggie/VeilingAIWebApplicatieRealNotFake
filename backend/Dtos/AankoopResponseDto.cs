namespace backend.Dtos
{
    /// <summary>
    /// Representatie van een succesvol verwerkte aankoop.
    /// </summary>
    public class AankoopResponseDto
    {
        /// <summary>De unieke identifier van de aankooptransactie.</summary>
        public int AankoopId { get; set; }
        
        /// <summary>Het ID van het gekochte product.</summary>
        public int ProductId { get; set; }
        
        /// <summary>De definitieve verkoopprijs per eenheid.</summary>
        public decimal Prijs { get; set; }
        
        /// <summary>Het totaal aantal gekochte eenheden.</summary>
        public int AanKoopHoeveelheid { get; set; }
        
        /// <summary>De huidige status van de aankoop (bijv. "Betaald", "In Afwachting").</summary>
        public string Status { get; set; } 
    }
}