namespace backend.Dtos
{
    public class AankoopResponseDto
    {
        public int AankoopId { get; set; }
        public int ProductId { get; set; }
        
        public decimal Prijs { get; set; }
        public int AanKoopHoeveelheid { get; set; }
        
        // maakt status aan die later naar betaald/onbetaald gezet kan worden ipv true/false bool
        public string Status { get; set; } 
    }
}