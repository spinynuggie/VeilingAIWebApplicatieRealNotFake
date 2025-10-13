using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAllModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "gebruiker",
                columns: table => new
                {
                    GebruikerId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naam = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Emailadres = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Straat = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Huisnummer = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Postcode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Woonplaats = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
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
                    OverigeProductinformatie = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_gegevens", x => x.ProductId);
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
                    table.ForeignKey(
                        name: "FK_veiling_meester_gebruiker_GebruikerId",
                        column: x => x.GebruikerId,
                        principalTable: "gebruiker",
                        principalColumn: "GebruikerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_veiling_meester_GebruikerId",
                table: "veiling_meester",
                column: "GebruikerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "product_gegevens");

            migrationBuilder.DropTable(
                name: "veiling_meester");

            migrationBuilder.DropTable(
                name: "verkoper");

            migrationBuilder.DropTable(
                name: "gebruiker");
        }
    }
}
