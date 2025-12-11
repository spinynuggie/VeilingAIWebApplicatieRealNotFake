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
    public class ProductGegevensControllerTests
    {
        private AppDbContext _context;
        private ProductGegevensController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"ProductGegevensTestDb_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            SeedTestData();

            _controller = new ProductGegevensController(_context);
        }

        private void SeedTestData()
        {
            _context.ProductGegevens.AddRange(
                new ProductGegevens
                {
                    ProductId = 1,
                    Fotos = "p1.jpg",
                    ProductNaam = "Apple",
                    ProductBeschrijving = "Fresh apple",
                    Hoeveelheid = 10,
                    StartPrijs = 1.00m,
                    EindPrijs = 2.00m,
                    Huidigeprijs = 1.50m,
                    VeilingId = 100,
                    VerkoperId = 1000
                },
                new ProductGegevens
                {
                    ProductId = 2,
                    Fotos = "p2.jpg",
                    ProductNaam = "Banana",
                    ProductBeschrijving = "Yellow banana",
                    Hoeveelheid = 20,
                    StartPrijs = 0.50m,
                    EindPrijs = 1.50m,
                    Huidigeprijs = 1.00m,
                    VeilingId = 101,
                    VerkoperId = 1001
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
        public async Task GetProductGegevens_ReturnsAll()
        {
            var result = await _controller.GetProductGegevens();

            Assert.IsNotNull(result.Value);
            var list = result.Value as List<ProductGegevens> ?? result.Value.ToList();
            Assert.AreEqual(2, list.Count);
            Assert.IsTrue(list.Any(p => p.ProductNaam == "Apple"));
            Assert.IsTrue(list.Any(p => p.ProductNaam == "Banana"));
        }

        [TestMethod]
        public async Task GetProductGegevens_ById_Found()
        {
            var result = await _controller.GetProductGegevens(1);

            Assert.IsNotNull(result.Value);
            Assert.AreEqual(1, result.Value.ProductId);
            Assert.AreEqual("Apple", result.Value.ProductNaam);
        }

        [TestMethod]
        public async Task GetProductGegevens_ById_NotFound()
        {
            var result = await _controller.GetProductGegevens(999);

            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task PostProductGegevens_CreatesAndReturnsCreatedAt()
        {
            var newProduct = new ProductGegevens
            {
                Fotos = "p3.jpg",
                ProductNaam = "Cherry",
                ProductBeschrijving = "Red cherry",
                Hoeveelheid = 30,
                StartPrijs = 2.00m,
                EindPrijs = 3.00m,
                Huidigeprijs = 2.50m,
                VeilingId = 102,
                VerkoperId = 1002
            };

            var result = await _controller.PostProductGegevens(newProduct);

            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
            var created = result.Result as CreatedAtActionResult;
            Assert.AreEqual("GetProductGegevens", created.ActionName);
            Assert.IsInstanceOfType(created.Value, typeof(ProductGegevens));
            var createdEntity = created.Value as ProductGegevens;
            Assert.AreEqual("Cherry", createdEntity.ProductNaam);

            var inDb = await _context.ProductGegevens.FindAsync(createdEntity.ProductId);
            Assert.IsNotNull(inDb);
            Assert.AreEqual("Cherry", inDb.ProductNaam);
        }

        [TestMethod]
        public async Task PutProductGegevens_MismatchedId_ReturnsBadRequest()
        {
            var dto = new ProductVeilingUpdateDto
            {
                ProductId = 2,
                VeilingId = 200,
                StartPrijs = 5.00m,
                EindPrijs = 10.00m
            };

            var result = await _controller.PutProductGegevens(1, dto);

            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
            var badRequest = result as BadRequestObjectResult;
            Assert.AreEqual("Product ID in URL (1) matcht niet met Body (2).", badRequest.Value);
        }

        [TestMethod]
        public async Task PutProductGegevens_NotFound_ReturnsNotFound()
        {
            var dto = new ProductVeilingUpdateDto
            {
                ProductId = 999,
                VeilingId = 300,
                StartPrijs = 6.00m,
                EindPrijs = 12.00m
            };

            var result = await _controller.PutProductGegevens(999, dto);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task PutProductGegevens_Updates_ReturnsNoContent()
        {
            var dto = new ProductVeilingUpdateDto
            {
                ProductId = 1,
                VeilingId = 555,
                StartPrijs = 9.99m,
                EindPrijs = 19.99m
            };

            var result = await _controller.PutProductGegevens(1, dto);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var updated = await _context.ProductGegevens.FindAsync(1);
            Assert.AreEqual(555, updated.VeilingId);
            Assert.AreEqual(9.99m, updated.StartPrijs);
            Assert.AreEqual(19.99m, updated.EindPrijs);
        }

        [TestMethod]
        public async Task DeleteProductGegevens_Existing_ReturnsNoContent_AndRemoves()
        {
            var result = await _controller.DeleteProductGegevens(1);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var deleted = await _context.ProductGegevens.FindAsync(1);
            Assert.IsNull(deleted);
        }

        [TestMethod]
        public async Task DeleteProductGegevens_NotFound_ReturnsNotFound()
        {
            var result = await _controller.DeleteProductGegevens(999);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
    }
}

