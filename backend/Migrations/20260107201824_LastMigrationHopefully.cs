using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class LastMigrationHopefully : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_aankoop_ProductId",
                table: "aankoop",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_aankoop_product_gegevens_ProductId",
                table: "aankoop",
                column: "ProductId",
                principalTable: "product_gegevens",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_aankoop_product_gegevens_ProductId",
                table: "aankoop");

            migrationBuilder.DropIndex(
                name: "IX_aankoop_ProductId",
                table: "aankoop");
        }
    }
}
