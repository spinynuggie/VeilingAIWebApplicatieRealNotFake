namespace backend.Dtos
{
    /// <summary>
    /// Volledige weergave van een product inclusief de actuele veilingstatus.
    /// </summary>
    public class ProductGegevensResponseDto
    {
        /// <summary>Het unieke ID van het product in de database.</summary>
        public int ProductId { get; set; }

        /// <summary>URL's van de afbeeldingen.</summary>
        public string Fotos { get; set; } = string.Empty;

        /// <summary>De naam van het product.</summary>
        public string ProductNaam { get; set; } = string.Empty;

        /// <summary>De productomschrijving.</summary>
        public string ProductBeschrijving { get; set; } = string.Empty;

        /// <summary>De resterende voorraad.</summary>
        public int Hoeveelheid { get; set; }

        /// <summary>De prijs waarmee de veilingklok voor dit product start.</summary>
        public decimal StartPrijs { get; set; }

        /// <summary>De absolute bodemprijs.</summary>
        public decimal EindPrijs { get; set; }

        /// <summary>De huidige prijs op de klok (real-time berekend).</summary>
        public decimal Huidigeprijs { get; set; }

        /// <summary>De identifier van de veiling waaraan dit product is gekoppeld.</summary>
        public int VeilingId { get; set; }

        /// <summary>Het ID van de verkoper.</summary>
        public int VerkoperId { get; set; }

        /// <summary>Gedetailleerde lijst van gekoppelde specificaties met namen en beschrijvingen.</summary>
        public List<SpecificatiesResponseDto> Specificaties { get; set; } = new();
    }
}