using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGebruikerIdToVerkoper : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GebruikerId",
                table: "verkoper",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_verkoper_GebruikerId",
                table: "verkoper",
                column: "GebruikerId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_verkoper_gebruiker_GebruikerId",
                table: "verkoper",
                column: "GebruikerId",
                principalTable: "gebruiker",
                principalColumn: "GebruikerId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_verkoper_gebruiker_GebruikerId",
                table: "verkoper");

            migrationBuilder.DropIndex(
                name: "IX_verkoper_GebruikerId",
                table: "verkoper");

            migrationBuilder.DropColumn(
                name: "GebruikerId",
                table: "verkoper");
        }
    }
}
