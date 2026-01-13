namespace backend.Dtos
{
    /// <summary>
    /// Data Transfer Object voor het bijwerken van een bestaande aankoop.
    /// Bevat enkel de velden die door een gebruiker gewijzigd mogen worden.
    /// </summary>
    public class AankoopUpdateDto
    {
        /// <summary>
        /// De gewenste nieuwe hoeveelheid van het product.
        /// Moet een positief getal zijn.
        /// </summary>
        /// <example>5</example>
        public int AanKoopHoeveelheid { get; set; }
    }
}