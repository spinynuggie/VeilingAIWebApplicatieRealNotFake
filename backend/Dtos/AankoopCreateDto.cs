    // backend/Dtos/AankoopCreateDto.cs
    using System.ComponentModel.DataAnnotations;

    namespace backend.Dtos
    {
        /// <summary>
        /// Gegevens benodigd voor het vastleggen van een nieuwe aankoop tijdens de veiling.
        /// </summary>
        public class AankoopCreateDto
        {
            /// <summary>De unieke identifier van het product dat wordt gekocht.</summary>
            public int ProductId { get; set; }
        
            /// <summary>De prijs per eenheid waarvoor het product is gekocht.</summary>
            public decimal Prijs { get; set; }
        
            /// <summary>Het aantal eenheden dat de koper wenst af te nemen.</summary>
            public int AanKoopHoeveelheid { get; set; }
        }
    }