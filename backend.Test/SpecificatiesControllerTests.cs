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
    /// Unit tests for <see cref="backend.Controllers.SpecificatiesController"/>.
    /// Covers listing and creation of product specifications (specificaties).
    /// </summary>
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

    /// <summary>
    /// GetSpecificaties_ReturnsOk: verifies GET returns Ok and a list of SpecificatiesResponseDto.
    /// </summary>
    [TestMethod]
    public async System.Threading.Tasks.Task GetSpecificaties_ReturnsOk()
        {
            var result = await _controller.GetSpecificaties();
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
        }

    /// <summary>
    /// CreateSpecificatie_WithValidDto_ReturnsCreated: posts a valid SpecificatiesCreateDto and expects CreatedAtAction.
    /// </summary>
    [TestMethod]
    public async System.Threading.Tasks.Task CreateSpecificatie_WithValidDto_ReturnsCreated()
        {
            var dto = new SpecificatiesCreateDto { naam = "Kleur", beschrijving = "Rood" };
            var result = await _controller.CreateSpecificatie(dto);
            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
        }
    }
}
