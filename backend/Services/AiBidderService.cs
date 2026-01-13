using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using System.Security.Claims;

namespace backend.Services
{
    public class AiBidderService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly AuctionRealtimeService _auctionRealtime;
        private readonly IChatClient _groqClient;
        private readonly ILogger<AiBidderService> _logger;
        private readonly List<int> _aiBidderIds = new();

        public AiBidderService(
            IServiceProvider services,
            AuctionRealtimeService auctionRealtime,
            [FromKeyedServices("Groq")] IChatClient groqClient,
            ILogger<AiBidderService> logger)
        {
            _services = services;
            _auctionRealtime = auctionRealtime;
            _groqClient = groqClient;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AI Bidder Service is starting.");

            // 1. Ensure AI Bidder accounts exist
            await EnsureAiBiddersExistAsync();

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // 2. Poll for active auctions every few seconds
                    // We'll simulate a "wait" to check the pulse of the auction
                    await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);

                    // Since we don't have a list of all active auction IDs easily accessible without reflection 
                    // or a registry, we'll assume there's at least one or check the database for current ones.
                    // For the demo, we'll check the database for auctions starting now.
                    using var scope = _services.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var activeAuctions = await db.Veiling
                        .Where(v => v.Starttijd <= DateTimeOffset.UtcNow && v.Eindtijd >= DateTimeOffset.UtcNow)
                        .ToListAsync(stoppingToken);

                    foreach (var auction in activeAuctions)
                    {
                        var state = _auctionRealtime.GetState(auction.VeilingId.ToString());
                        if (state == null || state.IsPaused || state.ActiveProduct == null) continue;

                        var product = state.ActiveProduct;

                        // 3. For each active product, decide if one of our AI bidders wants to bid
                        foreach (var bidderId in _aiBidderIds)
                        {
                            // Randomly decide to "look" at the product
                            if (Random.Shared.Next(0, 100) > 30) continue; 

                            var prompt = $@"
Actuele Veiling Status:
Product: {product.ProductNaam}
Startprijs: {product.StartPrice:C}
Huidige prijs: {product.CurrentPrice:C}
Resterende voorraad: {product.RemainingQty}

Jij bent een AI Bieder. Wil je een bod plaatsen? 
Antwoord alleen met 'BID' of 'SKIP'. 
Bied alleen als de prijs aantrekkelijk is (bijv. onder de 80% van de startprijs).";

                            var response = await _groqClient.CompleteAsync(prompt, cancellationToken: stoppingToken);
                            var decision = response.Message.Text?.Trim().ToUpper();

                            if (decision?.Contains("BID") == true)
                            {
                                var qty = Random.Shared.Next(1, Math.Min(5, product.RemainingQty + 1));
                                _logger.LogInformation("AI Bidder {BidderId} placing bid for {Qty} x {Product} at {Price}", bidderId, qty, product.ProductNaam, product.CurrentPrice);
                                
                                await _auctionRealtime.ProcessBidAsync(
                                    auction.VeilingId.ToString(), 
                                    product.ProductId, 
                                    product.CurrentPrice, 
                                    qty, 
                                    bidderId, 
                                    $"AI_{bidderId}");
                            }
                        }
                    }
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "Error in AI Bidder Service.");
                }
            }
        }

        private async Task EnsureAiBiddersExistAsync()
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();

            for (int i = 1; i <= 3; i++)
            {
                var email = $"ai_bidder_{i}@example.com";
                var user = await db.Gebruikers.FirstOrDefaultAsync(g => g.Emailadres == email);
                if (user == null)
                {
                    user = new Gebruiker
                    {
                        Emailadres = email,
                        Wachtwoord = hasher.Hash("ai-bidder-secret"),
                        Naam = $"AI Bid Bot {i}",
                        Role = "KLANT"
                    };
                    db.Gebruikers.Add(user);
                    await db.SaveChangesAsync();
                }
                _aiBidderIds.Add(user.GebruikerId);
            }
        }
    }
}
