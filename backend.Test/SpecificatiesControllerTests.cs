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
    [TestClass]
    public class SpecificatiesControllerTests
    {
        private AppDbContext _context;
        private SpecificatiesController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"SpecificatieTestDb_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            _context.Specificaties.Add(new Specificaties { SpecificatieId = 1, Naam = "Gewicht", Beschrijving = "10kg" });
            _context.SaveChanges();

            _controller = new SpecificatiesController(_context);
        }

        [TestCleanup]
        public void Cleanup()
        {
            _context.Dispose();
        }

        [TestMethod]
        public async System.Threading.Tasks.Task GetSpecificaties_ReturnsOk()
        {
            var result = await _controller.GetSpecificaties();
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
        }

        [TestMethod]
        public async System.Threading.Tasks.Task CreateSpecificatie_WithValidDto_ReturnsCreated()
        {
            var dto = new SpecificatiesCreateDto { naam = "Kleur", beschrijving = "Rood" };
            var result = await _controller.CreateSpecificatie(dto);
            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
        }
    }
}
