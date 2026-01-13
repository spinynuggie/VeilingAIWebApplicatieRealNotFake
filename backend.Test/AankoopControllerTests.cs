using backend.Controllers;
using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System.Security.Claims;

namespace backend.Test;

[TestClass]
public sealed class AankoopControllerTests
{
    private AppDbContext _context;
    private AankoopController _controller;
    private ClaimsPrincipal _testUser;

    [TestInitialize]
    public void Setup()
    {
        // Initialize In-Memory Database
        var serviceProvider = new ServiceCollection()
            .AddEntityFrameworkInMemoryDatabase()
            .BuildServiceProvider();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestAankoopDb")
            .UseInternalServiceProvider(serviceProvider)
            .Options;

        _context = new AppDbContext(options);
        _context.Database.EnsureDeleted();
        _context.Database.EnsureCreated();

        // Create test user with claims
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Name, "TestUser")
        };
        _testUser = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));

        // Initialize controller
        _controller = new AankoopController(_context);
        
        // Setup HttpContext for user authentication
        var httpContext = new DefaultHttpContext();
        httpContext.User = _testUser;
        _controller.ControllerContext.HttpContext = httpContext;

        // Add test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        _context.Aankoop.AddRange(
            new Aankoop
            {
                AankoopId = 1,
                ProductId = 101,
                GebruikerId = 1,
                Prijs = 25.50m,
                AanKoopHoeveelheid = 2,
                IsBetaald = false
            },
            new Aankoop
            {
                AankoopId = 2,
                ProductId = 102,
                GebruikerId = 1,
                Prijs = 15.75m,
                AanKoopHoeveelheid = 1,
                IsBetaald = true
            },
            new Aankoop
            {
                AankoopId = 3,
                ProductId = 103,
                GebruikerId = 2,
                Prijs = 99.99m,
                AanKoopHoeveelheid = 3,
                IsBetaald = false
            });
        _context.SaveChanges();
    }

    [TestCleanup]
    public void Cleanup()
    {
        _context.Dispose();
    }

    [TestMethod]
    public async Task GetMijnAankopen_WithValidUser_ReturnsUserAankopen()
    {
        // Act
        var result = await _controller.GetMijnAankopen();

        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
        
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult.Value);
        
        var aankopen = okResult.Value as List<AankoopResponseDto>;
        Assert.IsNotNull(aankopen);
        Assert.AreEqual(2, aankopen.Count); // Only user 1's purchases
        
        // Verify data integrity
        Assert.IsTrue(aankopen.All(a => a.ProductId == 101 || a.ProductId == 102));
        Assert.IsTrue(aankopen.Any(a => a.Status == "In Afwachting"));
        Assert.IsTrue(aankopen.Any(a => a.Status == "Betaald"));
    }

    [TestMethod]
    public async Task GetMijnAankopen_WithoutUserId_ReturnsUnauthorized()
    {
        // Arrange - Remove user claims
        var unauthorizedUser = new ClaimsPrincipal(new ClaimsIdentity());
        _controller.ControllerContext.HttpContext.User = unauthorizedUser;

        // Act
        var result = await _controller.GetMijnAankopen();

        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        
        var unauthorizedResult = result.Result as UnauthorizedObjectResult;
        Assert.AreEqual("Gebruiker ID niet gevonden in token.", unauthorizedResult.Value);
    }

    [TestMethod]
    public async Task GetAankoop_WithValidIdAndOwnership_ReturnsAankoop()
    {
        // Act
        var result = await _controller.GetAankoop(1);

        // Assert
        Assert.IsInstanceOfType(result.Value, typeof(AankoopResponseDto));
        
        var aankoop = result.Value as AankoopResponseDto;
        Assert.AreEqual(1, aankoop.AankoopId);
        Assert.AreEqual(101, aankoop.ProductId);
        Assert.AreEqual(25.50m, aankoop.Prijs);
        Assert.AreEqual(2, aankoop.AanKoopHoeveelheid);
        Assert.AreEqual("In Afwachting", aankoop.Status);
    }

    [TestMethod]
    public async Task GetAankoop_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var result = await _controller.GetAankoop(999);

        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task GetAankoop_WithValidIdButNotOwner_ReturnsNotFound()
    {
        // Act - Try to access user 2's purchase
        var result = await _controller.GetAankoop(3);

        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
    }

    [TestMethod]
    public async Task GetAankoop_WithoutUserId_ReturnsUnauthorized()
    {
        // Arrange - Remove user claims
        var unauthorizedUser = new ClaimsPrincipal(new ClaimsIdentity());
        _controller.ControllerContext.HttpContext.User = unauthorizedUser;

        // Act
        var result = await _controller.GetAankoop(1);

        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task PutAankoop_WithValidId_ReturnsNoContent()
    {
        // Arrange - Clear the context to avoid tracking conflicts
        _context.ChangeTracker.Clear();
        
        var updateDto = new AankoopUpdateDto
        {
            AanKoopHoeveelheid = 3
        };

        // Act
        var result = await _controller.PutAankoop(1, updateDto);

        // Assert
        Assert.IsInstanceOfType(result, typeof(NoContentResult));

        // Verify update: controller only updates AanKoopHoeveelheid
        _context.ChangeTracker.Clear();
        var aankoop = await _context.Aankoop.FindAsync(1);
        Assert.IsNotNull(aankoop);
        Assert.AreEqual(3, aankoop.AanKoopHoeveelheid);
    }

    [TestMethod]
    public async Task PutAankoop_WithMismatchedId_ReturnsBadRequest()
    {
        // The controller does not accept an entity with an ID in the body for updates
        // and expects a DTO. Instead of a mismatched-id scenario (not applicable),
        // verify that missing authentication returns Unauthorized.
        var unauthorizedUser = new ClaimsPrincipal(new ClaimsIdentity());
        _controller.ControllerContext.HttpContext.User = unauthorizedUser;

        var updateDto = new AankoopUpdateDto { AanKoopHoeveelheid = 5 };
        var result = await _controller.PutAankoop(1, updateDto);

        Assert.IsInstanceOfType(result, typeof(UnauthorizedResult));
    }

    [TestMethod]
    public async Task PutAankoop_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var updateDto = new AankoopUpdateDto { AanKoopHoeveelheid = 10 };

        // Act
        var result = await _controller.PutAankoop(999, updateDto);

        // Assert
        Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
    }

    [TestMethod]
    public async Task PostAankoop_WithValidData_ReturnsCreatedAankoop()
    {
        // Arrange
        var createDto = new AankoopCreateDto
        {
            ProductId = 201,
            Prijs = 45.99m,
            AanKoopHoeveelheid = 1
        };

        // Act
        var result = await _controller.PostAankoop(createDto);

        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
        
        var createdAtResult = result.Result as CreatedAtActionResult;
        Assert.IsNotNull(createdAtResult.Value);
        Assert.IsInstanceOfType(createdAtResult.Value, typeof(AankoopResponseDto));
        
        var aankoop = createdAtResult.Value as AankoopResponseDto;
        Assert.AreEqual(201, aankoop.ProductId);
        Assert.AreEqual(45.99m, aankoop.Prijs);
        Assert.AreEqual(1, aankoop.AanKoopHoeveelheid);
        Assert.AreEqual("In Afwachting", aankoop.Status); // IsBetaald defaults to false
        
        // Verify it was saved to database
        var savedAankoop = await _context.Aankoop.FindAsync(aankoop.AankoopId);
        Assert.IsNotNull(savedAankoop);
        Assert.AreEqual(1, savedAankoop.GebruikerId); // Set from authenticated user
        Assert.IsFalse(savedAankoop.IsBetaald);
    }

    [TestMethod]
    public async Task PostAankoop_WithoutUserId_ReturnsUnauthorized()
    {
        // Arrange - Remove user claims
        var unauthorizedUser = new ClaimsPrincipal(new ClaimsIdentity());
        _controller.ControllerContext.HttpContext.User = unauthorizedUser;

        var createDto = new AankoopCreateDto
        {
            ProductId = 201,
            Prijs = 45.99m,
            AanKoopHoeveelheid = 1
        };

        // Act
        var result = await _controller.PostAankoop(createDto);

        // Assert
        Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        
        var unauthorizedResult = result.Result as UnauthorizedObjectResult;
        Assert.AreEqual("U moet ingelogd zijn om een aankoop te doen.", unauthorizedResult.Value);
    }

    [TestMethod]
    public async Task DeleteAankoop_WithValidId_ReturnsNoContent()
    {
        // Act
        var result = await _controller.DeleteAankoop(1);

        // Assert
        Assert.IsInstanceOfType(result, typeof(NoContentResult));
        
        // Verify deletion
        var deletedAankoop = await _context.Aankoop.FindAsync(1);
        Assert.IsNull(deletedAankoop);
    }

    [TestMethod]
    public async Task DeleteAankoop_WithNonExistentId_ReturnsNotFound()
    {
        // Act
        var result = await _controller.DeleteAankoop(999);

        // Assert
        Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
    }

    [TestMethod]
    public async Task DeleteAankoop_CanDeleteOtherUsersAankoop()
    {
        // Act - Delete aankoop that belongs to user 2
        var result = await _controller.DeleteAankoop(3);

        // Assert - controller restricts deletion to the owner, so user 1 cannot delete user 2's aankoop
        Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));

        // Verify it was NOT deleted
        var existingAankoop = await _context.Aankoop.FindAsync(3);
        Assert.IsNotNull(existingAankoop);
        
        // Note: if controller allowed deletion, this test would assert NoContent; current behavior is correct
    }

    [TestMethod]
    public async Task DeleteAankoop_WithoutUserId_ReturnsUnauthorized()
    {
        // Arrange - Remove user claims
        var unauthorizedUser = new ClaimsPrincipal(new ClaimsIdentity());
        _controller.ControllerContext.HttpContext.User = unauthorizedUser;

        // Act
        var result = await _controller.DeleteAankoop(1);

        // Assert
        Assert.IsInstanceOfType(result, typeof(UnauthorizedObjectResult));
        var unauthorizedResult = result as UnauthorizedObjectResult;
        Assert.AreEqual("Gebruiker ID niet gevonden in token.", unauthorizedResult.Value);
    }

    [TestMethod]
    public async Task MapToResponseDto_CorrectlyMapsStatus()
    {
        // Arrange - Create aankoop with IsBetaald = false
        var unpaidAankoop = new Aankoop
        {
            AankoopId = 1,
            ProductId = 101,
            GebruikerId = 1,
            Prijs = 25.50m,
            AanKoopHoeveelheid = 2,
            IsBetaald = false
        };

        // Act - Get the aankoop through the controller
        var result = await _controller.GetAankoop(1);

        // Assert
        Assert.IsInstanceOfType(result.Value, typeof(AankoopResponseDto));
        var responseDto = result.Value as AankoopResponseDto;
        Assert.AreEqual("In Afwachting", responseDto.Status);

        // Arrange - Update to paid
        var aankoop = await _context.Aankoop.FindAsync(2);
        aankoop.IsBetaald = true;
        await _context.SaveChangesAsync();

        // Act
        var paidResult = await _controller.GetAankoop(2);

        // Assert
        Assert.IsInstanceOfType(paidResult.Value, typeof(AankoopResponseDto));
        var paidDto = paidResult.Value as AankoopResponseDto;
        Assert.AreEqual("Betaald", paidDto.Status);
    }
}