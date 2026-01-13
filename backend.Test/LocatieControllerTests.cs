using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using backend.Controllers;
using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace backend.Test
{
    /// <summary>
    /// Tests for <see cref="backend.Controllers.LocatieController"/> covering retrieval and creation of locations.
    /// </summary>
    [TestClass]
    public class LocatieControllerTests
    {
        private AppDbContext _context;
        private LocatieController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"LocatieTestDb_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            _context.Locaties.Add(new Locatie { LocatieId = 1, LocatieNaam = "Aalsmeer", Foto = "a.jpg" });
            _context.SaveChanges();

            _controller = new LocatieController(_context);
        }

        [TestCleanup]
        public void Cleanup()
        {
            _context.Dispose();
        }

    /// <summary>
    /// Ensures GetLocaties returns Ok with the available locations.
    /// </summary>
    [TestMethod]
    public async System.Threading.Tasks.Task GetLocaties_ReturnsOk()
        {
            var result = await _controller.GetLocaties();
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
        }

    /// <summary>
    /// Ensures creating a valid Locatie returns CreatedAtAction.
    /// </summary>
    [TestMethod]
    public async System.Threading.Tasks.Task CreateLocatie_WithValidDto_ReturnsCreated()
        {
            var dto = new LocatieCreateDto { LocatieNaam = "Naaldwijk", Foto = "n.jpg" };
            var result = await _controller.CreateLocatie(dto);
            Assert.IsInstanceOfType(result, typeof(CreatedAtActionResult));
        }

    /// <summary>
    /// Ensures creating a location with a null DTO returns BadRequest.
    /// </summary>
    [TestMethod]
    public async System.Threading.Tasks.Task CreateLocatie_WithNull_ReturnsBadRequest()
        {
            var result = await _controller.CreateLocatie(null);
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }
    }
}
