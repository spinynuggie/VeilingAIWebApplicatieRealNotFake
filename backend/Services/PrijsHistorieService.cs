using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace backend.Services
{
    /// <summary>
    /// High-performance price history service using raw SQL (no EF).
    /// Required by client mandate for performance optimization.
    /// </summary>
    public class PrijsHistorieService
    {
        private readonly string _connectionString;

        public PrijsHistorieService(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        /// <summary>
        /// Fetches all price history data for a product in one call.
        /// </summary>
        public async Task<PrijsHistorieResult> GetHistorieAsync(int productId, int verkoperId, string productNaam, string? userRole)
        {
            var result = new PrijsHistorieResult();

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            Console.WriteLine($"[PrijsHistorie] Verbinding geopend. Role: {userRole}");

            // Query 0: Get Seller Name
            await using (var cmd = new NpgsqlCommand(@"SELECT ""Naam"" FROM gebruiker WHERE ""GebruikerId"" = @id", conn))
            {
                cmd.Parameters.AddWithValue("id", verkoperId);
                var name = await cmd.ExecuteScalarAsync();
                result.CurrentSellerName = name?.ToString() ?? "Onbekend";
            }

            // Query 1: Last 10 prices from THIS seller for this product type
            // (Everyone can see this)
            await using (var cmd = new NpgsqlCommand(@"
                SELECT a.""Datum"", a.""Prijs""
                FROM aankoop a
                JOIN product_gegevens p ON a.""ProductId"" = p.""ProductId""
                WHERE p.""VerkoperId"" = @verkoperId AND p.""ProductNaam"" = @productNaam
                ORDER BY a.""Datum"" DESC
                LIMIT 10", conn))
            {
                cmd.Parameters.AddWithValue("verkoperId", verkoperId);
                cmd.Parameters.AddWithValue("productNaam", productNaam);
                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    result.SellerLast10.Add(new PriceEntry
                    {
                        Datum = reader.GetDateTime(0),
                        Prijs = reader.GetDecimal(1)
                    });
                }
            }

            // Query 2: Average price from THIS seller
            // (Everyone can see this)
            await using (var cmd = new NpgsqlCommand(@"
                SELECT AVG(a.""Prijs"")
                FROM aankoop a
                JOIN product_gegevens p ON a.""ProductId"" = p.""ProductId""
                WHERE p.""VerkoperId"" = @verkoperId AND p.""ProductNaam"" = @productNaam", conn))
            {
                cmd.Parameters.AddWithValue("verkoperId", verkoperId);
                cmd.Parameters.AddWithValue("productNaam", productNaam);
                var avg = await cmd.ExecuteScalarAsync();
                result.SellerAverage = avg == DBNull.Value ? null : Convert.ToDecimal(avg);
            }

            // RESTRICTION: KLANT cannot see global history (prices from other sellers)
            if (userRole != "KLANT")
            {
                // Query 3: Last 10 prices from ALL sellers for this product type
                await using (var cmd = new NpgsqlCommand(@"
                    SELECT g.""Naam"", a.""Datum"", a.""Prijs""
                    FROM aankoop a
                    JOIN product_gegevens p ON a.""ProductId"" = p.""ProductId""
                    JOIN gebruiker g ON p.""VerkoperId"" = g.""GebruikerId""
                    WHERE p.""ProductNaam"" = @productNaam
                    ORDER BY a.""Datum"" DESC
                    LIMIT 10", conn))
                {
                    cmd.Parameters.AddWithValue("productNaam", productNaam);
                    await using var reader = await cmd.ExecuteReaderAsync();
                    while (await reader.ReadAsync())
                    {
                        result.GlobalLast10.Add(new GlobalPriceEntry
                        {
                            SellerName = reader.GetString(0),
                            Datum = reader.GetDateTime(1),
                            Prijs = reader.GetDecimal(2)
                        });
                    }
                }

                // Query 4: Global average price for this product type
                await using (var cmd = new NpgsqlCommand(@"
                    SELECT AVG(a.""Prijs"")
                    FROM aankoop a
                    JOIN product_gegevens p ON a.""ProductId"" = p.""ProductId""
                    WHERE p.""ProductNaam"" = @productNaam", conn))
                {
                    cmd.Parameters.AddWithValue("productNaam", productNaam);
                    var avg = await cmd.ExecuteScalarAsync();
                    result.GlobalAverage = avg == DBNull.Value ? null : Convert.ToDecimal(avg);
                }
            }

            return result;
        }
    }

    // --- DTOs ---

    public class PrijsHistorieResult
    {
        public string? CurrentSellerName { get; set; }
        public List<PriceEntry> SellerLast10 { get; set; } = new();
        public decimal? SellerAverage { get; set; }
        public List<GlobalPriceEntry> GlobalLast10 { get; set; } = new();
        public decimal? GlobalAverage { get; set; }
    }

    public class PriceEntry
    {
        public DateTime Datum { get; set; }
        public decimal Prijs { get; set; }
    }

    public class GlobalPriceEntry
    {
        public string SellerName { get; set; } = "";
        public DateTime Datum { get; set; }
        public decimal Prijs { get; set; }
    }
}
