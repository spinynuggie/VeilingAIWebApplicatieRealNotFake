using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Zakelijke gegevens van een verkoper benodigd voor facturatie en verificatie.
    /// </summary>
    public class VerkoperDto
    {
        /// <summary>Het 8-cijferige Kamer van Koophandel nummer.</summary>
        [Required(ErrorMessage = "KvK-nummer is verplicht.")]
        public string KvkNummer { get; set; } = string.Empty;

        /// <summary>De naam van het bedrijf.</summary>
        [Required(ErrorMessage = "Bedrijfsnaam is verplicht.")]
        public string Bedrijfsnaam { get; set; } = string.Empty;

        /// <summary>De straatnaam van de vestiging.</summary>
        [Required(ErrorMessage = "Straat is verplicht.")]
        public string Straat { get; set; } = string.Empty;

        /// <summary>Het huisnummer van de vestiging.</summary>
        [Required(ErrorMessage = "Huisnummer is verplicht.")]
        public string Huisnummer { get; set; } = string.Empty;

        /// <summary>De postcode van de vestiging.</summary>
        [Required(ErrorMessage = "Postcode is verplicht.")]
        public string Postcode { get; set; } = string.Empty;

        /// <summary>De woonplaats van de vestiging.</summary>
        [Required(ErrorMessage = "Woonplaats is verplicht.")]
        public string Woonplaats { get; set; } = string.Empty;

        /// <summary>Informatie over bankrekeningen of BTW-nummers.</summary>
        public string FinancieleGegevens { get; set; } = string.Empty;
    }
}
