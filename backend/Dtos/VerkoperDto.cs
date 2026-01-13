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

        /// <summary>Extra informatie over het bedrijf of handelsnamen.</summary>
        [Required(ErrorMessage = "Bedrijfsgegevens zijn verplicht.")]
        public string Bedrijfsgegevens { get; set; } = string.Empty;

        /// <summary>Het officiële vestigingsadres voor post en logistiek.</summary>
        [Required(ErrorMessage = "Adresgegevens zijn verplicht.")]
        public string Adresgegevens { get; set; } = string.Empty;

        /// <summary>Informatie over bankrekeningen of BTW-nummers.</summary>
        public string FinancieleGegevens { get; set; } = string.Empty;
    }
}
