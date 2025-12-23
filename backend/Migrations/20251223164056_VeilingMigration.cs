using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class VeilingMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_product_gegevens_ProductNaam",
                table: "product_gegevens");

            migrationBuilder.DropIndex(
                name: "IX_product_gegevens_ProductNaam_VerkoperId",
                table: "product_gegevens");

            migrationBuilder.DropIndex(
                name: "IX_aankoop_ProductId_CreatedAt",
                table: "aankoop");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_product_gegevens_ProductNaam",
                table: "product_gegevens",
                column: "ProductNaam");

            migrationBuilder.CreateIndex(
                name: "IX_product_gegevens_ProductNaam_VerkoperId",
                table: "product_gegevens",
                columns: new[] { "ProductNaam", "VerkoperId" });

            migrationBuilder.CreateIndex(
                name: "IX_aankoop_ProductId_CreatedAt",
                table: "aankoop",
                columns: new[] { "ProductId", "CreatedAt" });
        }
    }
}
