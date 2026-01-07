using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceHistoryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Datum column already exists in DB, skipping AddColumn
            
            // Manual Index Creation for Performance
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IDX_ProductGegevens_Zoeken"" 
                ON product_gegevens (""VerkoperId"", ""ProductNaam"");
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IDX_Aankoop_Datum"" 
                ON aankoop (""ProductId"", ""Datum"" DESC);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropColumn(name: "Datum", table: "aankoop");

            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IDX_ProductGegevens_Zoeken"";");
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS ""IDX_Aankoop_Datum"";");
        }
    }
}
