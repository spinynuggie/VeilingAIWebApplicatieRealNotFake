using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Controllers;
using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace backend.Test
{
    /// <summary>
    /// Tests for <see cref="backend.Controllers.VeilingController"/> covering CRUD operations for auctions.
    /// </summary>
    [TestClass]
    public class VeilingControllerTests
    {
        private AppDbContext _context;
        private VeilingController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"VeilingTestDb_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            SeedTestData();

            _controller = new VeilingController(_context);
        }

        private void SeedTestData()
        {
            _context.Veiling.AddRange(
                new Veiling
                {
                    VeilingId = 1,
                    Naam = "Electronics",
                    Beschrijving = "Gadgets",
                    Image = "img1.jpg",
                    LocatieId = 1,
                    Starttijd = new DateTimeOffset(2025, 1, 1, 10, 0, 0, TimeSpan.Zero),
                    Eindtijd = new DateTimeOffset(2025, 1, 1, 12, 0, 0, TimeSpan.Zero),
                    VeilingMeesterId = 1
                },
                new Veiling
                {
                    VeilingId = 2,
                    Naam = "Art",
                    Beschrijving = "Paintings",
                    Image = "img2.jpg",
                    LocatieId = 2,
                    Starttijd = new DateTimeOffset(2025, 2, 1, 10, 0, 0, TimeSpan.Zero),
                    Eindtijd = new DateTimeOffset(2025, 2, 1, 12, 0, 0, TimeSpan.Zero),
                    VeilingMeesterId = 2
                }
            );
            _context.SaveChanges();
        }

        [TestCleanup]
        public void Cleanup()
        {
            _context.Dispose();
        }

    /// <summary>
    /// Ensures GetVeiling returns all auctions in the database.
    /// </summary>
    [TestMethod]
    public async Task GetVeiling_ReturnsAll()
        {
            var result = await _controller.GetVeiling();

            Assert.IsNotNull(result.Value);
            var list = result.Value as List<Veiling> ?? result.Value.ToList();
            Assert.AreEqual(2, list.Count);
            Assert.IsTrue(list.Any(v => v.Naam == "Electronics"));
            Assert.IsTrue(list.Any(v => v.Naam == "Art"));
        }

    /// <summary>
    /// Ensures GetVeiling(id) returns the matching auction when found.
    /// </summary>
    [TestMethod]
    public async Task GetVeiling_ById_Found()
        {
            var result = await _controller.GetVeiling(1);

            Assert.IsNotNull(result.Value);
            Assert.AreEqual(1, result.Value.VeilingId);
            Assert.AreEqual("Electronics", result.Value.Naam);
        }

    /// <summary>
    /// Ensures GetVeiling(id) returns NotFound for unknown ids.
    /// </summary>
    [TestMethod]
    public async Task GetVeiling_ById_NotFound()
        {
            var result = await _controller.GetVeiling(999);

            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Ensures creating a new auction returns CreatedAtAction and persists the entity.
    /// </summary>
    [TestMethod]
    public async Task PostVeiling_Creates_ReturnsCreatedAt()
        {
            var dto = new VeilingDto
            {
                Naam = "Books",
                Beschrijving = "Novels",
                Image = "img3.jpg",
                LocatieId = 3,
                Starttijd = new DateTimeOffset(2025, 3, 1, 10, 0, 0, TimeSpan.Zero),
                Eindtijd = new DateTimeOffset(2025, 3, 1, 12, 0, 0, TimeSpan.Zero),
                VeilingMeesterId = 3
            };

            var result = await _controller.PostVeiling(dto);

            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
            var created = result.Result as CreatedAtActionResult;
            Assert.AreEqual("GetVeiling", created.ActionName);
            Assert.IsInstanceOfType(created.Value, typeof(Veiling));
            var entity = created.Value as Veiling;
            Assert.AreEqual("Books", entity.Naam);

            var inDb = await _context.Veiling.FindAsync(entity.VeilingId);
            Assert.IsNotNull(inDb);
            Assert.AreEqual("Books", inDb.Naam);
        }

    /// <summary>
    /// Ensures updating a non-existent auction returns NotFound.
    /// </summary>
    [TestMethod]
    public async Task PutVeiling_NotFound_ReturnsNotFound()
        {
            var dto = new VeilingDto
            {
                Naam = "X",
                Beschrijving = "Y",
                Image = "Z",
                LocatieId = 4,
                Starttijd = new DateTimeOffset(2025, 4, 1, 10, 0, 0, TimeSpan.Zero),
                Eindtijd = new DateTimeOffset(2025, 4, 1, 12, 0, 0, TimeSpan.Zero),
                VeilingMeesterId = 1
            };

            var result = await _controller.PutVeiling(999, dto);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Ensures updating an existing auction persists changes and returns NoContent.
    /// </summary>
    [TestMethod]
    public async Task PutVeiling_Updates_ReturnsNoContent()
        {
            var dto = new VeilingDto
            {
                Naam = "Electronics Updated",
                Beschrijving = "Gadgets+",
                Image = "img1u.jpg",
                LocatieId = 5,
                Starttijd = new DateTimeOffset(2025, 1, 1, 11, 0, 0, TimeSpan.Zero),
                Eindtijd = new DateTimeOffset(2025, 1, 1, 13, 0, 0, TimeSpan.Zero),
                VeilingMeesterId = 5
            };

            var result = await _controller.PutVeiling(1, dto);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var updated = await _context.Veiling.FindAsync(1);
            Assert.AreEqual("Electronics Updated", updated.Naam);
            Assert.AreEqual("Gadgets+", updated.Beschrijving);
            Assert.AreEqual("img1u.jpg", updated.Image);
            Assert.AreEqual(5, updated.LocatieId);
            Assert.AreEqual(new DateTimeOffset(2025, 1, 1, 11, 0, 0, TimeSpan.Zero), updated.Starttijd);
            Assert.AreEqual(new DateTimeOffset(2025, 1, 1, 13, 0, 0, TimeSpan.Zero), updated.Eindtijd);
            Assert.AreEqual(5, updated.VeilingMeesterId);
        }

    /// <summary>
    /// Ensures deleting an existing auction returns NoContent and removes it.
    /// </summary>
    [TestMethod]
    public async Task DeleteVeiling_Existing_ReturnsNoContent()
        {
            var result = await _controller.DeleteVeiling(1);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var deleted = await _context.Veiling.FindAsync(1);
            Assert.IsNull(deleted);
        }

    /// <summary>
    /// Ensures deleting a non-existent auction returns NotFound.
    /// </summary>
    [TestMethod]
    public async Task DeleteVeiling_NotFound_ReturnsNotFound()
        {
            var result = await _controller.DeleteVeiling(999);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
    }
}
