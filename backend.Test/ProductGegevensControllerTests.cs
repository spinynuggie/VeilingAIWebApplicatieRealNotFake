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
    /// Tests for <see cref="backend.Controllers.ProductGegevensController"/> covering CRUD and related behaviours.
    /// </summary>
    [TestClass]
    public class ProductGegevensControllerTests
    {
    private AppDbContext? _context;
    private ProductGegevensController? _controller;

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
            _context!.ProductGegevens.AddRange(
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
                    VerkoperId = 1000,
                    LocatieId = 1,
                    ProductSpecificaties = new List<ProductSpecificatie>()
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
                    VerkoperId = 1001,
                    LocatieId = 1,
                    ProductSpecificaties = new List<ProductSpecificatie>()
                }
            );
            _context!.SaveChanges();
        }

        [TestCleanup]
        public void Cleanup()
        {
            _context!.Dispose();
        }

    /// <summary>
    /// Verifies getting all product records returns the expected list.
    /// </summary>
    [TestMethod]
    public async Task GetProductGegevens_ReturnsAll()
        {
            var result = await _controller!.GetProductGegevens();

            Assert.IsNotNull(result.Value);
            var list = result.Value as List<ProductGegevens> ?? result.Value.ToList();
            Assert.AreEqual(2, list.Count);
            Assert.IsTrue(list.Any(p => p.ProductNaam == "Apple"));
            Assert.IsTrue(list.Any(p => p.ProductNaam == "Banana"));
        }

    /// <summary>
    /// Verifies retrieving a product by id returns the expected DTO when found.
    /// </summary>
    [TestMethod]
    public async Task GetProductGegevens_ById_Found()
        {
            var result = await _controller!.GetProductGegevens(1);

            // Controller returns Ok(response) so check Result (OkObjectResult) and its Value
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var ok = result.Result as OkObjectResult;
            Assert.IsNotNull(ok!.Value);
            var dto = ok.Value as ProductGegevensResponseDto;
            Assert.IsNotNull(dto);
            Assert.AreEqual(1, dto.ProductId);
            Assert.AreEqual("Apple", dto.ProductNaam);
        }

    /// <summary>
    /// Verifies retrieving a non-existent product id yields NotFound.
    /// </summary>
    [TestMethod]
    public async Task GetProductGegevens_ById_NotFound()
        {
            var result = await _controller!.GetProductGegevens(999);

            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Verifies creating a new product returns CreatedAtAction and persists the entity.
    /// </summary>
    [TestMethod]
    public async Task PostProductGegevens_CreatesAndReturnsCreatedAt()
        {
            var newProductDto = new ProductCreateDto
            {
                Fotos = "p3.jpg",
                ProductNaam = "Cherry",
                ProductBeschrijving = "Red cherry",
                Hoeveelheid = 30,
                Eindprijs = 3.00m,
                VerkoperId = 1002,
                LocatieId = 10,
                SpecificatieIds = new List<int>()
            };

            var result = await _controller!.PostProductGegevens(newProductDto);

            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
            var created = result.Result as CreatedAtActionResult;
            Assert.IsNotNull(created);
            Assert.AreEqual("GetProductGegevens", created!.ActionName);
            Assert.IsNotNull(created.Value);

            // CreatedAtAction returns an anonymous projection; use reflection to get ProductId/ProductNaam
            var createdObj = created.Value;
            var prodIdProp = createdObj.GetType().GetProperty("ProductId");
            var prodNaamProp = createdObj.GetType().GetProperty("ProductNaam");
            Assert.IsNotNull(prodIdProp);
            Assert.IsNotNull(prodNaamProp);

            var createdId = (int)prodIdProp.GetValue(createdObj)!;
            var createdNaam = (string)prodNaamProp.GetValue(createdObj)!;
            Assert.AreEqual("Cherry", createdNaam);

            var inDb = await _context!.ProductGegevens.FindAsync(createdId);
            Assert.IsNotNull(inDb);
            Assert.AreEqual("Cherry", inDb.ProductNaam);
        }

    /// <summary>
    /// Verifies PutProductGegevens returns BadRequest when route id and DTO id mismatch.
    /// </summary>
    [TestMethod]
    public async Task PutProductGegevens_MismatchedId_ReturnsBadRequest()
        {
            var dto = new ProductUpdateDto
            {
                ProductId = 2,
                ProductNaam = "Banana Updated",
                Fotos = "p2u.jpg",
                ProductBeschrijving = "Yellow banana updated",
                Hoeveelheid = 20,
                StartPrijs = 0.75m,
                Eindprijs = 1.50m,
                LocatieId = 11,
                SpecificatieIds = new List<int>()
            };

            var result = await _controller!.PutProductGegevens(1, dto);

            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
            var badRequest = result as BadRequestObjectResult;
            Assert.IsNotNull(badRequest);
        }

    /// <summary>
    /// Verifies PutProductGegevens returns NotFound when product does not exist.
    /// </summary>
    [TestMethod]
    public async Task PutProductGegevens_NotFound_ReturnsNotFound()
        {
            var dto = new ProductUpdateDto
            {
                ProductId = 999,
                ProductNaam = "X",
                Fotos = "", 
                ProductBeschrijving = "",
                Hoeveelheid = 0,
                StartPrijs = 0m,
                Eindprijs = 0m,
                LocatieId = 0,
                SpecificatieIds = new List<int>()
            };

            var result = await _controller!.PutProductGegevens(999, dto);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Verifies successful update of product returns NoContent and persists changes.
    /// </summary>
    [TestMethod]
    public async Task PutProductGegevens_Updates_ReturnsNoContent()
        {
            var dto = new ProductUpdateDto
            {
                ProductId = 1,
                ProductNaam = "Apple Updated",
                Fotos = "p1u.jpg",
                ProductBeschrijving = "Fresh apple updated",
                Hoeveelheid = 12,
                StartPrijs = 9.99m,
                Eindprijs = 19.99m,
                LocatieId = 12,
                SpecificatieIds = new List<int>()
            };

            var result = await _controller!.PutProductGegevens(1, dto);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var updated = await _context!.ProductGegevens.FindAsync(1);
            Assert.IsNotNull(updated);
            Assert.AreEqual(9.99m, updated!.StartPrijs);
            Assert.AreEqual(19.99m, updated!.EindPrijs);
        }

    /// <summary>
    /// Verifies deleting an existing product returns NoContent and removes it from the DB.
    /// </summary>
    [TestMethod]
    public async Task DeleteProductGegevens_Existing_ReturnsNoContent_AndRemoves()
        {
            var result = await _controller!.DeleteProductGegevens(1);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var deleted = await _context!.ProductGegevens.FindAsync(1);
            Assert.IsNull(deleted);
        }

    /// <summary>
    /// Verifies deleting a non-existent product id yields NotFound.
    /// </summary>
    [TestMethod]
    public async Task DeleteProductGegevens_NotFound_ReturnsNotFound()
        {
            var result = await _controller!.DeleteProductGegevens(999);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
    }
}

