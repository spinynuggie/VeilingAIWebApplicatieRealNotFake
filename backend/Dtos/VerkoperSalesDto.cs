using System;

namespace backend.Dtos
{
    /// <summary>
    /// Rapportage-object voor verkopers om hun historische verkoopresultaten in te zien.
    /// </summary>
    public class VerkoperSalesDto
    {
        /// <summary>ID van het verkochte product.</summary>
        public int ProductId { get; set; }

        /// <summary>De naam van het product zoals het geveild is.</summary>
        public string ProductNaam { get; set; } = string.Empty;

        /// <summary>De uiteindelijke afmijn-prijs per eenheid.</summary>
        public decimal Verkoopprijs { get; set; }

        /// <summary>Het aantal eenheden dat in deze transactie is verkocht.</summary>
        public int Aantal { get; set; }

        /// <summary>Het exacte tijdstip van de verkoop.</summary>
        public DateTimeOffset Datum { get; set; }

        /// <summary>De naam van de koper die op de knop heeft gedrukt.</summary>
        public string KoperNaam { get; set; } = string.Empty;
    }
}
