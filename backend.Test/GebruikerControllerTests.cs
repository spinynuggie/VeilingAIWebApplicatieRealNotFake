// backend.Tests/GebruikerControllerTests.cs

using backend.Controllers;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
    private Mock<IConfiguration> _mockConfiguration;
    private Mock<ILogger<GebruikerController>> _mockLogger;

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

        // 3. Initialiseer de Mocks
        _mockPasswordHasher = new Mock<PasswordHasher>();
        _mockConfiguration = new Mock<IConfiguration>();
        _mockLogger = new Mock<ILogger<GebruikerController>>();

        // Setup configuration mock values
        _mockConfiguration.Setup(c => c["Jwt:Issuer"]).Returns("VeilingAI");
        _mockConfiguration.Setup(c => c["Jwt:Audience"]).Returns("VeilingAIUsers");
        _mockConfiguration.Setup(c => c["Jwt:Key"]).Returns("dev-secret-change-me");

        // 4. Initialiseer de GebruikerController
        _controller = new GebruikerController(_context, _mockPasswordHasher.Object, _mockLogger.Object, _mockConfiguration.Object);

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
            Role = "VERKOPER", // Een andere rol
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

    [TestMethod]
    public async Task GetGebruiker_WithValidId_ReturnsGebruikerResponseDto()
    {
        // Act
        var result = await _controller.GetGebruiker(1);
    
        // Assert
        Assert.IsNotNull(result.Value);
        Assert.IsInstanceOfType(result.Value, typeof(GebruikerResponseDto));
        
        var gebruiker = result.Value as GebruikerResponseDto;
        Assert.AreEqual(1, gebruiker.GebruikerId);
        Assert.AreEqual("Gebruiker1", gebruiker.Naam);
        Assert.AreEqual("Gebruiker1@gmail.com", gebruiker.Emailadres);
        Assert.AreEqual("KOPER", gebruiker.Role);
    }

    [TestMethod]
    public async Task GetGebruiker_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var result = await _controller.GetGebruiker(999);
    
        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task PutGebruiker_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var updateDto = new GebruikerUpdateDto
        {
            Naam = "Updated Naam",
            Emailadres = "updated@test.nl",
            Straat = "Updated Straat",
            Huisnummer = "999",
            Postcode = "1234 AB",
            Woonplaats = "Updated City"
        };
    
        // Act
        var result = await _controller.PutGebruiker(1, updateDto);
    
        // Assert
        Assert.IsInstanceOfType(result, typeof(NoContentResult));
        
        // Verify the update
        var updatedGebruiker = await _context.Gebruikers.FindAsync(1);
        Assert.AreEqual("Updated Naam", updatedGebruiker.Naam);
        Assert.AreEqual("updated@test.nl", updatedGebruiker.Emailadres);
    }

    [TestMethod]
    public async Task PutGebruiker_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var updateDto = new GebruikerUpdateDto
        {
            Naam = "Updated Naam",
            Emailadres = "updated@test.nl",
            Straat = "Updated Straat",
            Huisnummer = "999",
            Postcode = "1234 AB",
            Woonplaats = "Updated City"
        };
    
        // Act
        var result = await _controller.PutGebruiker(999, updateDto);
    
        // Assert
        Assert.IsInstanceOfType(result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task PostGebruiker_WithValidData_ReturnsGebruikerResponseDto()
    {
        // Arrange
        var createDto = new GebruikerCreateDto
        {
            Naam = "New User",
            Emailadres = "newuser@test.nl",
            Wachtwoord = "password123"
        };
        
        // Mock the password hasher
        _mockPasswordHasher.Setup(x => x.Hash(It.IsAny<string>())).Returns("hashedPassword");
    
        // Act
        var result = await _controller.PostGebruiker(createDto);
    
        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
        
        var createdAtResult = result.Result as CreatedAtActionResult;
        Assert.IsNotNull(createdAtResult.Value);
        Assert.IsInstanceOfType(createdAtResult.Value, typeof(GebruikerResponseDto));
        
        var gebruiker = createdAtResult.Value as GebruikerResponseDto;
        Assert.AreEqual("New User", gebruiker.Naam);
        Assert.AreEqual("newuser@test.nl", gebruiker.Emailadres);
        Assert.AreEqual("KOPER", gebruiker.Role);
    }

    [TestMethod]
    public async Task DeleteGebruiker_WithValidId_ReturnsNoContent()
    {
        // Act
        var result = await _controller.DeleteGebruiker(1);
    
        // Assert
        Assert.IsInstanceOfType(result, typeof(NoContentResult));
        
        // Verify deletion
        var deletedGebruiker = await _context.Gebruikers.FindAsync(1);
        Assert.IsNull(deletedGebruiker);
    }

    [TestMethod]
    public async Task DeleteGebruiker_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var result = await _controller.DeleteGebruiker(999);
    
        // Assert
        Assert.IsInstanceOfType(result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task Register_WithValidData_ReturnsGebruikerResponseDto()
    {
        // Arrange
        var registerRequest = new GebruikerController.RegisterRequest
        {
            Naam = "Registered User",
            Emailadres = "registered@test.nl",
            Wachtwoord = "password123"
        };
        
        // Mock the password hasher
        _mockPasswordHasher.Setup(x => x.Hash(It.IsAny<string>())).Returns("hashedPassword");
    
        // Act
        var result = await _controller.Register(registerRequest);
    
        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
        
        var createdAtResult = result.Result as CreatedAtActionResult;
        Assert.IsNotNull(createdAtResult.Value);
        Assert.IsInstanceOfType(createdAtResult.Value, typeof(GebruikerResponseDto));
        
        var gebruiker = createdAtResult.Value as GebruikerResponseDto;
        Assert.AreEqual("Registered User", gebruiker.Naam);
        Assert.AreEqual("registered@test.nl", gebruiker.Emailadres);
        Assert.AreEqual("KOPER", gebruiker.Role);
    }

    [TestMethod]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        // Arrange
        var registerRequest = new GebruikerController.RegisterRequest
        {
            Naam = "Duplicate User",
            Emailadres = "Gebruiker1@gmail.com", // Already exists
            Wachtwoord = "password123"
        };
    
        // Act
        var result = await _controller.Register(registerRequest);
    
        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(BadRequestObjectResult));
        
        var badRequestResult = result.Result as BadRequestObjectResult;
        Assert.AreEqual("E-mailadres is al geregistreerd.", badRequestResult.Value);
    }

    [TestMethod]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        // Arrange
        var loginRequest = new GebruikerController.LoginRequest
        {
            Emailadres = "Gebruiker1@gmail.com",
            Wachtwoord = "password123"
        };
        
        // Mock the password hasher to return true for verification
        _mockPasswordHasher.Setup(x => x.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(true);
    
        // Act
        var result = await _controller.Login(loginRequest);
    
        // Assert
        Assert.IsInstanceOfType(result, typeof(OkObjectResult));
        
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult.Value);
    }

    [TestMethod]
    public async Task Login_WithInvalidEmail_ReturnsNotFound()
    {
        // Arrange
        var loginRequest = new GebruikerController.LoginRequest
        {
            Emailadres = "nonexistent@test.nl",
            Wachtwoord = "password123"
        };
    
        // Act
        var result = await _controller.Login(loginRequest);
    
        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundObjectResult));
        
        var notFoundResult = result.Result as NotFoundObjectResult;
        Assert.AreEqual("Gebruiker niet gevonden.", notFoundResult.Value);
    }

    [TestMethod]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var loginRequest = new GebruikerController.LoginRequest
        {
            Emailadres = "Gebruiker1@gmail.com",
            Wachtwoord = "wrongpassword"
        };
        
        // Mock the password hasher to return false for verification
        _mockPasswordHasher.Setup(x => x.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(false);
    
        // Act
        var result = await _controller.Login(loginRequest);
    
        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        
        var unauthorizedResult = result.Result as UnauthorizedObjectResult;
        Assert.AreEqual("Ongeldig wachtwoord.", unauthorizedResult.Value);
    }
}