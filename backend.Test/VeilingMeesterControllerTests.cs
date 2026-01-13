using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace backend.Test
{
    [TestClass]
    public class VeilingMeesterControllerTests
    {
        private AppDbContext _context;
        private VeilingMeesterController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"VeilingMeesterTestDb_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            SeedTestData();

            _controller = new VeilingMeesterController(_context);
        }

        private void SeedTestData()
        {
            _context.VeilingMeesters.AddRange(
                new VeilingMeester { MeesterId = 1, GebruikerId = 5 },
                new VeilingMeester { MeesterId = 2, GebruikerId = 10 }
            );
            _context.SaveChanges();
        }

        [TestCleanup]
        public void Cleanup()
        {
            _context.Dispose();
        }

        [TestMethod]
        public async Task PostVeilingMeester_Creates_ReturnsCreatedAt()
        {
            var dto = new VeilingMeesterDto { GebruikerId = 99 };

            var result = await _controller.PostVeilingMeester(dto);

            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
            var created = result.Result as CreatedAtActionResult;
            Assert.IsInstanceOfType(created.Value, typeof(VeilingMeester));
            var entity = created.Value as VeilingMeester;
            Assert.AreEqual(99, entity.GebruikerId);

            var inDb = await _context.VeilingMeesters.FindAsync(entity.MeesterId);
            Assert.IsNotNull(inDb);
            Assert.AreEqual(99, inDb.GebruikerId);
        }

        [TestMethod]
        public async Task PutVeilingMeester_NotFound_ReturnsNotFound()
        {
            var dto = new VeilingMeesterDto { GebruikerId = 7 };
            var result = await _controller.PutVeilingMeester(999, dto);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task PutVeilingMeester_Updates_ReturnsNoContent()
        {
            var dto = new VeilingMeesterDto { GebruikerId = 42 };
            var result = await _controller.PutVeilingMeester(1, dto);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var updated = await _context.VeilingMeesters.FindAsync(1);
            Assert.AreEqual(42, updated.GebruikerId);
        }

        [TestMethod]
        public async Task DeleteVeilingMeester_Existing_ReturnsNoContent()
        {
            var result = await _controller.DeleteVeilingMeester(1);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            var deleted = await _context.VeilingMeesters.FindAsync(1);
            Assert.IsNull(deleted);
        }

        [TestMethod]
        public async Task DeleteVeilingMeester_NotFound_ReturnsNotFound()
        {
            var result = await _controller.DeleteVeilingMeester(999);
            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }
    }
}
