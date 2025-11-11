using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using DotNetEnv;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace backend.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            // Try load from environment (e.g. DATABASE_URL). If not set, fall back to appsettings.json
            Env.Load();
            var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");


            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(connectionString);
            return new AppDbContext(optionsBuilder.Options);
        }
    }
}