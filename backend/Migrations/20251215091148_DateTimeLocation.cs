using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class DateTimeLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE veiling
                ALTER COLUMN ""Starttijd"" TYPE timestamp with time zone
                USING to_timestamp(""Starttijd"")
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE veiling
                ALTER COLUMN ""Eindtijd"" TYPE timestamp with time zone
                USING to_timestamp(""Eindtijd"")
            ");

            migrationBuilder.AddColumn<string>(
                name: "Locatie",
                table: "veiling",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Locatie",
                table: "veiling");

            migrationBuilder.Sql(@"
                ALTER TABLE veiling
                ALTER COLUMN ""Starttijd"" TYPE integer
                USING (EXTRACT(EPOCH FROM ""Starttijd"")::integer)
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE veiling
                ALTER COLUMN ""Eindtijd"" TYPE integer
                USING (EXTRACT(EPOCH FROM ""Eindtijd"")::integer)
            ");
        }
    }
}
