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
                    Starttijd = 10,
                    Eindtijd = 20,
                    VeilingMeesterId = 1
                },
                new Veiling
                {
                    VeilingId = 2,
                    Naam = "Art",
                    Beschrijving = "Paintings",
                    Image = "img2.jpg",
                    Starttijd = 30,
                    Eindtijd = 40,
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

        [TestMethod]
        public async Task GetVeiling_ById_Found()
        {
            var result = await _controller.GetVeiling(1);

            Assert.IsNotNull(result.Value);
            Assert.AreEqual(1, result.Value.VeilingId);
            Assert.AreEqual("Electronics", result.Value.Naam);
        }

        [TestMethod]
        public async Task GetVeiling_ById_NotFound()
        {
            var result = await _controller.GetVeiling(999);

            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task PostVeiling_Creates_ReturnsCreatedAt()
        {
            var dto = new VeilingDto
            {
                Naam = "Books",
                Beschrijving = "Novels",
                Image = "img3.jpg",
                Starttijd = 50,
                Eindtijd = 60,
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

        [TestMethod]
        public async Task PutVeiling_NotFound_ReturnsNotFound()
        {
            var dto = new VeilingDto
            {
                Naam = "X",
                Beschrijving = "Y",
                Image = "Z",
                Starttijd = 1,
                Eindtijd = 2,
                VeilingMeesterId = 1
            };

            var result = await _controller.PutVeiling(999, dto);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task PutVeiling_Updates_ReturnsNoContent()
        {
            var dto = new VeilingDto
            {
                Naam = "Electronics Updated",
                Beschrijving = "Gadgets+",
                Image = "img1u.jpg",
                Starttijd = 15,
                Eindtijd = 25,
                VeilingMeesterId = 5
            };

            var result = await _controller.PutVeiling(1, dto);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var updated = await _context.Veiling.FindAsync(1);
            Assert.AreEqual("Electronics Updated", updated.Naam);
            Assert.AreEqual("Gadgets+", updated.Beschrijving);
            Assert.AreEqual("img1u.jpg", updated.Image);
            Assert.AreEqual(15, updated.Starttijd);
            Assert.AreEqual(25, updated.Eindtijd);
            Assert.AreEqual(5, updated.VeilingMeesterId);
        }

        [TestMethod]
        public async Task DeleteVeiling_Existing_ReturnsNoContent()
        {
            var result = await _controller.DeleteVeiling(1);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var deleted = await _context.Veiling.FindAsync(1);
            Assert.IsNull(deleted);
        }

        [TestMethod]
        public async Task DeleteVeiling_NotFound_ReturnsNotFound()
        {
            var result = await _controller.DeleteVeiling(999);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
    }
}

