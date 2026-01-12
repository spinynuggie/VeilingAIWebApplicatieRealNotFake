using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Gegevens benodigd voor de eerste registratie van een product door een verkoper.
    /// </summary>
    public class ProductCreateDto
    {
        /// <summary>Een komma-gescheiden lijst of enkele URL van productfoto's.</summary>
        public string Fotos { get; set; } = string.Empty;

        /// <summary>De commerciële naam van het product.</summary>
        public string ProductNaam { get; set; } = string.Empty;

        /// <summary>Uitgebreide omschrijving van het product (kenmerken, versheid, etc.).</summary>
        public string ProductBeschrijving { get; set; } = string.Empty;

        /// <summary>Het totaal aantal eenheden (stuks/vaten) dat wordt aangeboden.</summary>
        public int Hoeveelheid { get; set; }

        /// <summary>De minimale prijs waarvoor het product verkocht mag worden.</summary>
        public decimal Eindprijs { get; set; }

        /// <summary>De unieke identifier van de aanbiedende verkoper.</summary>
        public int VerkoperId { get; set; }

        /// <summary>De ID van de fysieke locatie waar het product zich bevindt.</summary>
        public int LocatieId { get; set; }

        /// <summary>Lijst van ID's die verwijzen naar specifieke productkenmerken (bijv. Kleur, Lengte).</summary>
        public List<int> SpecificatieIds { get; set; } = new List<int>();
    }

    /// <summary>
    /// Gegevens voor het bijwerken van een bestaand product. 
    /// Wordt gebruikt door verkopers of beheerders om productinformatie of prijsmarges aan te passen.
    /// </summary>
    public class ProductUpdateDto
    {
        /// <summary>De unieke identifier van het product dat bijgewerkt moet worden.</summary>
        [Required]
        public int ProductId { get; set; }

        /// <summary>De gewijzigde commerciële naam van het product.</summary>
        public string ProductNaam { get; set; } = string.Empty;

        /// <summary>Bijgewerkte URL('s) van de productafbeeldingen.</summary>
        public string Fotos { get; set; } = string.Empty;

        /// <summary>De geactualiseerde beschrijving van het product.</summary>
        public string ProductBeschrijving { get; set; } = string.Empty;

        /// <summary>De actuele voorraad die beschikbaar wordt gesteld voor de veiling.</summary>
        public int Hoeveelheid { get; set; }

        /// <summary>De nieuwe startprijs waarop de veilingklok begint met aftellen.</summary>
        public decimal StartPrijs { get; set; }

        /// <summary>De nieuwe bodemprijs (minimale verkoopprijs) van het product.</summary>
        public decimal Eindprijs { get; set; }

        /// <summary>De ID van de (eventueel nieuwe) fysieke locatie van het product.</summary>
        public int LocatieId { get; set; }

        /// <summary>De volledige lijst van specificatie-ID's die aan dit product gekoppeld moeten zijn (overschrijft bestaande koppelingen).</summary>
        public List<int> SpecificatieIds { get; set; } = new List<int>();
    }
}