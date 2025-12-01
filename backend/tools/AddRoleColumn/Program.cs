using System;
using System.IO;
using Npgsql;

string? conn = Environment.GetEnvironmentVariable("DATABASE_URL");
// If DATABASE_URL not set, try to find a .env file by walking up the directory tree
if (string.IsNullOrEmpty(conn))
{
    var dir = new DirectoryInfo(AppContext.BaseDirectory);
    for (int i = 0; i < 6 && dir != null; i++)
    {
        var candidate = Path.Combine(dir.FullName, ".env");
        if (File.Exists(candidate))
        {
            var lines = File.ReadAllLines(candidate);
            foreach (var l in lines)
            {
                if (l.StartsWith("DATABASE_URL="))
                {
                    conn = l.Substring("DATABASE_URL=".Length).Trim();
                    break;
                }
            }
            if (!string.IsNullOrEmpty(conn)) break;
        }
        dir = dir.Parent;
    }
}

if (string.IsNullOrEmpty(conn))
{
    Console.Error.WriteLine("No DATABASE_URL found in environment or .env");
    return 1;
}

try
{
    using var c = new NpgsqlConnection(conn);
    c.Open();

    // Add role column if it doesn't exist (lowercase 'role')
    var sql = @"ALTER TABLE gebruiker ADD COLUMN IF NOT EXISTS role character varying(50) NOT NULL DEFAULT 'KOPER';";
    using var cmd = new NpgsqlCommand(sql, c);
    cmd.ExecuteNonQuery();

    Console.WriteLine("ALTER TABLE executed (role column ensured).");
    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine("Error executing SQL: " + ex.Message);
    return 2;
}
