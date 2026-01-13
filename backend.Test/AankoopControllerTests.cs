using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using backend.Controllers;
using backend.Data;
using backend.Models;
using backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace backend.Test
{
    /// <summary>
    /// Unit tests for <see cref="backend.Controllers.AankoopController"/>.
    /// Covers retrieval, creation, update and deletion of purchases and authorization scenarios.
    /// </summary>
    [TestClass]
    public sealed class AankoopControllerTests
    {
    private AppDbContext? _context;
    private AankoopController? _controller;
    private ClaimsPrincipal? _testUser;

        [TestInitialize]
        public void Setup()
        {
            // Initialize In-Memory Database
            var serviceProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .BuildServiceProvider();

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"AankoopTestDb_{Guid.NewGuid()}")
                .UseInternalServiceProvider(serviceProvider)
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            // Create test user with required fields
            var gebruiker = new Gebruiker
            {
                GebruikerId = 1,
                Naam = "TestUser",
                Emailadres = "test@example.com",
                Wachtwoord = "secret"
            };
            _context.Gebruikers.Add(gebruiker);

            // Add purchases
            _context.Aankoop.AddRange(
                new Aankoop { AankoopId = 1, ProductId = 101, GebruikerId = 1, Prijs = 25.50m, AanKoopHoeveelheid = 2, IsBetaald = false },
                new Aankoop { AankoopId = 2, ProductId = 102, GebruikerId = 1, Prijs = 15.75m, AanKoopHoeveelheid = 1, IsBetaald = true },
                new Aankoop { AankoopId = 3, ProductId = 103, GebruikerId = 2, Prijs = 99.99m, AanKoopHoeveelheid = 3, IsBetaald = false }
            );

            _context.SaveChanges();

            // Create test principal
            var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "1"), new Claim(ClaimTypes.Name, "TestUser") };
            _testUser = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

            // Initialize controller
            _controller = new AankoopController(_context);
            var httpContext = new DefaultHttpContext { User = _testUser };
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        [TestCleanup]
        public void Cleanup()
        {
            _context!.Dispose();
        }

    /// <summary>
    /// Ensures GetMijnAankopen returns the purchases belonging to the authenticated user.
    /// </summary>
    [TestMethod]
    public async Task GetMijnAankopen_WithValidUser_ReturnsUserAankopen()
        {
            var result = await _controller!.GetMijnAankopen();
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));

            var okResult = result.Result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.IsNotNull(okResult!.Value);

            var aankopen = okResult.Value as List<AankoopResponseDto>;
            Assert.IsNotNull(aankopen);
            Assert.AreEqual(2, aankopen.Count);
        }

    /// <summary>
    /// Ensures GetMijnAankopen returns Unauthorized when no user id claim is present.
    /// </summary>
    [TestMethod]
    public async Task GetMijnAankopen_WithoutUserId_ReturnsUnauthorized()
        {
            // remove claims
            _controller!.ControllerContext.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity());
            var result = await _controller.GetMijnAankopen();
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        }

    /// <summary>
    /// Ensures GetAankoop returns the expected purchase when id exists and belongs to user.
    /// </summary>
    [TestMethod]
    public async Task GetAankoop_WithValidIdAndOwnership_ReturnsAankoop()
        {
            var result = await _controller!.GetAankoop(1);
            Assert.IsInstanceOfType(result.Value, typeof(AankoopResponseDto));
            var aankoop = result.Value as AankoopResponseDto;
            Assert.AreEqual(1, aankoop.AankoopId);
        }

    /// <summary>
    /// Ensures GetAankoop returns NotFound for a non-existent purchase id.
    /// </summary>
    [TestMethod]
    public async Task GetAankoop_WithInvalidId_ReturnsNotFound()
        {
            var result = await _controller!.GetAankoop(999);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Ensures PutAankoop updates the entity and returns NoContent on success.
    /// </summary>
    [TestMethod]
    public async Task PutAankoop_WithValidId_ReturnsNoContent()
        {
            var updateDto = new AankoopUpdateDto { AanKoopHoeveelheid = 5 };
            var result = await _controller!.PutAankoop(1, updateDto);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            var updated = await _context!.Aankoop.FindAsync(1);
            Assert.IsNotNull(updated);
            Assert.AreEqual(5, updated!.AanKoopHoeveelheid);
        }

    /// <summary>
    /// Ensures PutAankoop returns NotFound when the target purchase does not exist.
    /// </summary>
    [TestMethod]
    public async Task PutAankoop_WithNonExistentId_ReturnsNotFound()
        {
            var updateDto = new AankoopUpdateDto { AanKoopHoeveelheid = 10 };
            var result = await _controller!.PutAankoop(999, updateDto);
            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }

    /// <summary>
    /// Ensures PostAankoop creates a new purchase and returns CreatedAtAction.
    /// </summary>
    [TestMethod]
    public async Task PostAankoop_WithValidData_ReturnsCreated()
        {
            var createDto = new AankoopCreateDto { ProductId = 201, Prijs = 45.99m, AanKoopHoeveelheid = 1 };
            var res = await _controller!.PostAankoop(createDto);
            Assert.IsInstanceOfType(res.Result, typeof(CreatedAtActionResult));
        }

    /// <summary>
    /// Ensures DeleteAankoop removes an existing purchase and returns NoContent.
    /// </summary>
    [TestMethod]
    public async Task DeleteAankoop_Existing_ReturnsNoContent()
        {
            var res = await _controller!.DeleteAankoop(1);
            Assert.IsInstanceOfType(res, typeof(NoContentResult));
        }
    }
}