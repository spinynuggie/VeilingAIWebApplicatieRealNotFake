using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PriceHistoryController : ControllerBase
    {
        private readonly string _connectionString;

        public PriceHistoryController(IConfiguration configuration)
        {
            _connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Database connection string ontbreekt.");
        }

        [HttpGet("{productId:int}")]
        public async Task<ActionResult<HistoricalPriceResponseDto>> GetPriceHistory(int productId)
        {
            if (productId <= 0)
            {
                return BadRequest("Ongeldig product ID.");
            }

            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            string? productNaam = null;
            int verkoperId = 0;

            await using (var productCmd = new NpgsqlCommand(
                             "SELECT \"ProductNaam\", \"VerkoperId\" FROM product_gegevens WHERE \"ProductId\" = @productId",
                             connection))
            {
                productCmd.Parameters.AddWithValue("productId", productId);

                await using var reader = await productCmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    productNaam = reader.GetString(0);
                    verkoperId = reader.GetInt32(1);
                }
            }

            if (productNaam == null)
            {
                return NotFound("Product niet gevonden.");
            }

            decimal? averagePrice = null;
            await using (var avgCmd = new NpgsqlCommand(
                             @"SELECT AVG(a.""Prijs"")
                               FROM aankoop a
                               JOIN product_gegevens p ON p.""ProductId"" = a.""ProductId""
                               WHERE p.""ProductNaam"" = @productNaam",
                             connection))
            {
                avgCmd.Parameters.AddWithValue("productNaam", productNaam);
                var result = await avgCmd.ExecuteScalarAsync();
                if (result != DBNull.Value && result != null)
                {
                    averagePrice = Convert.ToDecimal(result);
                }
            }

            var currentSupplier = await ReadPricePointsAsync(
                connection,
                @"SELECT a.""Prijs"", a.""CreatedAt""
                  FROM aankoop a
                  JOIN product_gegevens p ON p.""ProductId"" = a.""ProductId""
                  WHERE p.""ProductNaam"" = @productNaam AND p.""VerkoperId"" = @verkoperId
                  ORDER BY a.""CreatedAt"" DESC
                  LIMIT 10",
                new Dictionary<string, object>
                {
                    ["productNaam"] = productNaam,
                    ["verkoperId"] = verkoperId
                });

            var allSuppliers = await ReadPricePointsAsync(
                connection,
                @"SELECT a.""Prijs"", a.""CreatedAt""
                  FROM aankoop a
                  JOIN product_gegevens p ON p.""ProductId"" = a.""ProductId""
                  WHERE p.""ProductNaam"" = @productNaam
                  ORDER BY a.""CreatedAt"" DESC
                  LIMIT 10",
                new Dictionary<string, object>
                {
                    ["productNaam"] = productNaam
                });

            return Ok(new HistoricalPriceResponseDto
            {
                ProductId = productId,
                ProductNaam = productNaam,
                VerkoperId = verkoperId,
                AveragePrice = averagePrice,
                Last10CurrentSupplier = currentSupplier,
                Last10AllSuppliers = allSuppliers
            });
        }

        private static async Task<List<HistoricalPricePointDto>> ReadPricePointsAsync(
            NpgsqlConnection connection,
            string sql,
            IReadOnlyDictionary<string, object> parameters)
        {
            var results = new List<HistoricalPricePointDto>();

            await using var cmd = new NpgsqlCommand(sql, connection);
            foreach (var parameter in parameters)
            {
                cmd.Parameters.AddWithValue(parameter.Key, parameter.Value);
            }

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var price = reader.GetDecimal(0);
                var created = reader.GetDateTime(1);
                if (created.Kind == DateTimeKind.Unspecified)
                {
                    created = DateTime.SpecifyKind(created, DateTimeKind.Utc);
                }
                results.Add(new HistoricalPricePointDto
                {
                    Prijs = price,
                    CreatedAt = new DateTimeOffset(created)
                });
            }

            return results;
        }
    }
}
