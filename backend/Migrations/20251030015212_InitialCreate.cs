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
                name: "Aankoop",
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
                    table.PrimaryKey("PK_Aankoop", x => x.AankoopId);
                });

            migrationBuilder.CreateTable(
                name: "gebruiker",
                columns: table => new
                {
                    GebruikerId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Emailadres = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Wachtwoord = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Straat = table.Column<string>(type: "text", nullable: false),
                    Huisnummer = table.Column<string>(type: "text", nullable: false),
                    Postcode = table.Column<string>(type: "text", nullable: false),
                    Woonplaats = table.Column<string>(type: "text", nullable: false)
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
                    Hoeveelheid = table.Column<int>(type: "integer", nullable: false),
                    ProductBeschrijving = table.Column<string>(type: "text", nullable: false),
                    VerkoperId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_gegevens", x => x.ProductId);
                });

            migrationBuilder.CreateTable(
                name: "TestModels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TestName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestModels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "veiling",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "text", nullable: false),
                    Starttijd = table.Column<int>(type: "integer", nullable: false),
                    Eindtijd = table.Column<int>(type: "integer", nullable: false),
                    Startprijs = table.Column<decimal>(type: "numeric", nullable: false),
                    Huidigeprijs = table.Column<decimal>(type: "numeric", nullable: false),
                    VeilingMeesterId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_veiling", x => x.Id);
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
                    FinancieleGegevens = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_verkoper", x => x.VerkoperId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Aankoop");

            migrationBuilder.DropTable(
                name: "gebruiker");

            migrationBuilder.DropTable(
                name: "product_gegevens");

            migrationBuilder.DropTable(
                name: "TestModels");

            migrationBuilder.DropTable(
                name: "veiling");

            migrationBuilder.DropTable(
                name: "veiling_meester");

            migrationBuilder.DropTable(
                name: "verkoper");
        }
    }
}
