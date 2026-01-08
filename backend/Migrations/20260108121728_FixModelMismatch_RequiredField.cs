using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixModelMismatch_RequiredField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_product_specificaties_product_gegevens_ProductGegevensProdu~",
                table: "product_specificaties");

            migrationBuilder.DropIndex(
                name: "IX_product_specificaties_ProductGegevensProductId",
                table: "product_specificaties");

            migrationBuilder.DropColumn(
                name: "ProductGegevensProductId",
                table: "product_specificaties");

            migrationBuilder.CreateIndex(
                name: "IX_product_specificaties_ProductId",
                table: "product_specificaties",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_product_specificaties_SpecificatieId",
                table: "product_specificaties",
                column: "SpecificatieId");

            migrationBuilder.AddForeignKey(
                name: "FK_product_specificaties_product_gegevens_ProductId",
                table: "product_specificaties",
                column: "ProductId",
                principalTable: "product_gegevens",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_product_specificaties_specificaties_SpecificatieId",
                table: "product_specificaties",
                column: "SpecificatieId",
                principalTable: "specificaties",
                principalColumn: "SpecificatieId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_product_specificaties_product_gegevens_ProductId",
                table: "product_specificaties");

            migrationBuilder.DropForeignKey(
                name: "FK_product_specificaties_specificaties_SpecificatieId",
                table: "product_specificaties");

            migrationBuilder.DropIndex(
                name: "IX_product_specificaties_ProductId",
                table: "product_specificaties");

            migrationBuilder.DropIndex(
                name: "IX_product_specificaties_SpecificatieId",
                table: "product_specificaties");

            migrationBuilder.AddColumn<int>(
                name: "ProductGegevensProductId",
                table: "product_specificaties",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_specificaties_ProductGegevensProductId",
                table: "product_specificaties",
                column: "ProductGegevensProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_product_specificaties_product_gegevens_ProductGegevensProdu~",
                table: "product_specificaties",
                column: "ProductGegevensProductId",
                principalTable: "product_gegevens",
                principalColumn: "ProductId");
        }
    }
}
