using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAuctionRealtimeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "aankoop",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            migrationBuilder.AddColumn<int>(
                name: "ActiefProductId",
                table: "veiling",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VeilingVolgorde",
                table: "product_gegevens",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_aankoop_ProductId_CreatedAt",
                table: "aankoop",
                columns: new[] { "ProductId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_product_gegevens_ProductNaam",
                table: "product_gegevens",
                column: "ProductNaam");

            migrationBuilder.CreateIndex(
                name: "IX_product_gegevens_ProductNaam_VerkoperId",
                table: "product_gegevens",
                columns: new[] { "ProductNaam", "VerkoperId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_aankoop_ProductId_CreatedAt",
                table: "aankoop");

            migrationBuilder.DropIndex(
                name: "IX_product_gegevens_ProductNaam",
                table: "product_gegevens");

            migrationBuilder.DropIndex(
                name: "IX_product_gegevens_ProductNaam_VerkoperId",
                table: "product_gegevens");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "aankoop");

            migrationBuilder.DropColumn(
                name: "ActiefProductId",
                table: "veiling");

            migrationBuilder.DropColumn(
                name: "VeilingVolgorde",
                table: "product_gegevens");
        }
    }
}
