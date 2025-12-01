// backend.Tests/GebruikerControllerTests.cs

using backend.Controllers;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace backend.Test;

[TestClass]
public sealed class GebruikerControllerTests
{
    // 1. Declareer de benodigde private velden
    private AppDbContext _context;
    private GebruikerController _controller;
    private Mock<PasswordHasher> _mockPasswordHasher;
    private readonly ILogger<GebruikerController> _logger;

// ---

    [TestInitialize] // wordt vóór élke test uitgevoerd
    public void Setup()
    {
        // initialize de In-Memory Database
        var serviceProvider = new ServiceCollection()
            .AddEntityFrameworkInMemoryDatabase()
            .BuildServiceProvider();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestGebruikerDb")
            .UseInternalServiceProvider(serviceProvider)
            .Options;

        _context = new AppDbContext(options);
        _context.Database.EnsureDeleted(); // Zorgt voor een schone start
        _context.Database.EnsureCreated();

        // 3. Initialiseer de Mock voor de PasswordHasher
        _mockPasswordHasher = new Mock<PasswordHasher>();

        // 4. Initialiseer de GebruikerController
        // De controller krijgt de mock database en de mock hasher mee
        _controller = new GebruikerController(_context, _mockPasswordHasher.Object,ILogger<GebruikerController> logger);

        _context.Gebruikers.AddRange(new Gebruiker
        {
            GebruikerId = 1,
            Naam = "Gebruiker1",
            Emailadres = "Gebruiker1@gmail.com",
            Wachtwoord = "HashedWachtwoord",
            Role = "KOPER",
            Woonplaats = "Woonplaats",
            Straat = "Straat",
            Postcode = "Postcode",
            Huisnummer = "Huisnummer"
        },
        new Gebruiker
        {
            GebruikerId = 2,
            Naam = "Gebruiker2",
            Emailadres = "gebruiker2@test.nl",
            Wachtwoord = "HashedWachtwoord2",
            Role = "KOPER",
            Woonplaats = "B",
            Straat = "S2",
            Postcode = "P2",
            Huisnummer = "2"
        },
        new Gebruiker
        {
            GebruikerId = 3,
            Naam = "Gebruiker3",
            Emailadres = "gebruiker3@test.nl",
            Wachtwoord = "HashedWachtwoord3",
            //Role = "VERKOPER", // Een andere rol
            Woonplaats = "C",
            Straat = "S3",
            Postcode = "P3",
            Huisnummer = "3"
        });
        _context.SaveChanges();
        //meer testdata
    }



    [TestCleanup]
    public void Cleanup()
    {
        // Ruim de database-context op na elke test
        _context.Dispose();
    }
    
// ---

    [TestMethod]
    public async Task GetGebruikers_ReturnsListOfGebruikersResponseDtos()
    {
        // Act
        var result = await _controller.GetGebruikers();
    
        // Assert 1: Controleer of de Value niet null is.
        // Dit betekent dat de API succesvol is en data heeft geretourneerd (equivalent aan 200 OK).
        Assert.IsNotNull(result.Value, "De controller zou direct een lijst van GebruikerResponseDto's moeten retourneren.");
    
        // Assert 2: Controleer of de direct geretourneerde Value het juiste type heeft.
        Assert.IsInstanceOfType(result.Value, typeof(List<GebruikerResponseDto>));
    
        // Assert 3: Wijs de Value toe om de inhoud te controleren
        var gebruikers = result.Value as List<GebruikerResponseDto>;
        Assert.IsNotNull(gebruikers);

        // Assert 4: Controleer het juiste aantal gebruikers (3, op basis van je Setup)
        Assert.AreEqual(3, gebruikers.Count);
    
        // Assert 5: Controleer dat de gevoelige velden (Wachtwoord) NIET in de DTO zitten.
        Assert.IsFalse(gebruikers.Any(g => g.GetType().GetProperty("Wachtwoord") != null), "Wachtwoordveld mag niet in de DTO zijn");
        Assert.AreEqual("Gebruiker1@gmail.com", gebruikers.First().Emailadres);
    }
}