using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Gebruiker>  Gebruikers { get; set; }
        public DbSet<ProductGegevens>  ProductGegevens { get; set; }
        public DbSet<VeilingMeester> VeilingMeesters { get; set; }
        public DbSet<Verkoper>  Verkopers { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<backend.Models.Aankoop> Aankoop { get; set; } = default!;
        public DbSet<backend.Models.Veiling> Veiling { get; set; } = default!;
    }
}
