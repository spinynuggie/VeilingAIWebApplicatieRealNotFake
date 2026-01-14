using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// DTO voor het ophalen van aankoopgegevens van een specifieke gebruiker.
    /// Bevat alle relevante informatie voor het weergeven van biedingen/aankopen.
    /// </summary>
    public class GebruikerAankoopDto
    {
        /// <summary>De unieke identifier van de aankooptransactie.</summary>
        public int AankoopId { get; set; }

        /// <summary>Het ID van het gekochte product.</summary>
        [Required(ErrorMessage = "ProductId is verplicht")]
        public int ProductId { get; set; }

        /// <summary>Naam van het gekochte product.</summary>
        [Required(ErrorMessage = "ProductNaam is verplicht")]
        [StringLength(200, ErrorMessage = "ProductNaam mag maximaal 200 karakters bevatten")]
        public string ProductNaam { get; set; } = string.Empty;

        /// <summary>De datum waarop de aankoop is gedaan.</summary>
        [Required(ErrorMessage = "Datum is verplicht")]
        public DateTime Datum { get; set; }

        /// <summary>Geeft aan of de aankoop is betaald.</summary>
        public bool IsBetaald { get; set; }

        /// <summary>Het totaal aantal gekochte eenheden.</summary>
        [Required(ErrorMessage = "AankoopHoeveelheid is verplicht")]
        [Range(1, int.MaxValue, ErrorMessage = "AankoopHoeveelheid moet minimaal 1 zijn")]
        public int AankoopHoeveelheid { get; set; }

        /// <summary>De definitieve verkoopprijs per eenheid.</summary>
        [Required(ErrorMessage = "Prijs is verplicht")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Prijs moet groter dan 0 zijn")]
        public decimal Prijs { get; set; }

        /// <summary>Het totaalbedrag van de aankoop (Prijs * AankoopHoeveelheid).</summary>
        public decimal TotaalBedrag => Prijs * AankoopHoeveelheid;
    }
}
