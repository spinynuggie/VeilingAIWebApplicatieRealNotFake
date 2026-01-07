using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "aankoop",
                columns: table => new
                {
                    AankoopId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    GebruikerId = table.Column<int>(type: "integer", nullable: false),
                    Prijs = table.Column<decimal>(type: "numeric", nullable: false),
                    AanKoopHoeveelheid = table.Column<int>(type: "integer", nullable: false),
                    IsBetaald = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_aankoop", x => x.AankoopId);
                });

            migrationBuilder.CreateTable(
                name: "gebruiker",
                columns: table => new
                {
                    GebruikerId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Emailadres = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Wachtwoord = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Straat = table.Column<string>(type: "text", nullable: true),
                    Huisnummer = table.Column<string>(type: "text", nullable: true),
                    Postcode = table.Column<string>(type: "text", nullable: true),
                    Woonplaats = table.Column<string>(type: "text", nullable: true),
                    Role = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_gebruiker", x => x.GebruikerId);
                });

            migrationBuilder.CreateTable(
                name: "product_gegevens",
                columns: table => new
                {
                    ProductId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Fotos = table.Column<string>(type: "text", nullable: false),
                    ProductNaam = table.Column<string>(type: "text", nullable: false),
                    ProductBeschrijving = table.Column<string>(type: "text", nullable: false),
                    Hoeveelheid = table.Column<int>(type: "integer", nullable: false),
                    StartPrijs = table.Column<decimal>(type: "numeric", nullable: false),
                    EindPrijs = table.Column<decimal>(type: "numeric", nullable: false),
                    Huidigeprijs = table.Column<decimal>(type: "numeric", nullable: false),
                    VeilingId = table.Column<int>(type: "integer", nullable: false),
                    VerkoperId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_gegevens", x => x.ProductId);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GebruikerId = table.Column<int>(type: "integer", nullable: false),
                    Token = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReplacedByToken = table.Column<string>(type: "text", nullable: true),
                    Revoked = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "specificaties",
                columns: table => new
                {
                    SpecificatieId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false),
                    Beschrijving = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_specificaties", x => x.SpecificatieId);
                });

            migrationBuilder.CreateTable(
                name: "veiling",
                columns: table => new
                {
                    VeilingId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false),
                    Beschrijving = table.Column<string>(type: "text", nullable: false),
                    Image = table.Column<string>(type: "text", nullable: false),
                    Starttijd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Eindtijd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    VeilingMeesterId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_veiling", x => x.VeilingId);
                });

            migrationBuilder.CreateTable(
                name: "veiling_meester",
                columns: table => new
                {
                    MeesterId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GebruikerId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_veiling_meester", x => x.MeesterId);
                });

            migrationBuilder.CreateTable(
                name: "verkoper",
                columns: table => new
                {
                    VerkoperId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KvkNummer = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Bedrijfsgegevens = table.Column<string>(type: "text", nullable: false),
                    Adresgegevens = table.Column<string>(type: "text", nullable: false),
                    FinancieleGegevens = table.Column<string>(type: "text", nullable: false),
                    GebruikerId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_verkoper", x => x.VerkoperId);
                });

            migrationBuilder.CreateTable(
                name: "product_specificaties",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    SpecificatieId = table.Column<int>(type: "integer", nullable: false),
                    ProductGegevensProductId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_specificaties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_specificaties_product_gegevens_ProductGegevensProdu~",
                        column: x => x.ProductGegevensProductId,
                        principalTable: "product_gegevens",
                        principalColumn: "ProductId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_product_specificaties_ProductGegevensProductId",
                table: "product_specificaties",
                column: "ProductGegevensProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "aankoop");

            migrationBuilder.DropTable(
                name: "gebruiker");

            migrationBuilder.DropTable(
                name: "product_specificaties");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "specificaties");

            migrationBuilder.DropTable(
                name: "veiling");

            migrationBuilder.DropTable(
                name: "veiling_meester");

            migrationBuilder.DropTable(
                name: "verkoper");

            migrationBuilder.DropTable(
                name: "product_gegevens");
        }
    }
}
