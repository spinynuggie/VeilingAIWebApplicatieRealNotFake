using System;
using Microsoft.EntityFrameworkCore;
using backend.Controllers;
using backend.Data;
using backend.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Test
{
    [TestClass]
    public class SearchControllerTests
    {
        private AppDbContext _context;
        private SearchController _controller;

        [TestInitialize]
        public void Setup()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"SearchTestDb_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            // Add test data
            SeedTestData();

            _controller = new SearchController(_context);
        }

        private void SeedTestData()
        {
            // Add test products
            _context.ProductGegevens.AddRange(
                new backend.Models.ProductGegevens
                {
                    ProductId = 1,
                    ProductNaam = "Test Product 1",
                    Fotos = "test1.jpg",
                    ProductBeschrijving = "Test product description"
                },
                new backend.Models.ProductGegevens
                {
                    ProductId = 2,
                    ProductNaam = "Another Product",
                    Fotos = "test2.jpg",
                    ProductBeschrijving = "Another product description"
                }
            );

            // Add test auctions
            _context.Veiling.AddRange(
                new backend.Models.Veiling
                {
                    VeilingId = 1,
                    Naam = "Test Auction 1",
                    Image = "auction1.jpg",
                    Beschrijving = "Test auction description",
                    Locatie = "Aalsmeer",
                    Starttijd = new DateTimeOffset(2025, 1, 1, 10, 0, 0, TimeSpan.Zero),
                    Eindtijd = new DateTimeOffset(2025, 1, 1, 12, 0, 0, TimeSpan.Zero),
                    VeilingMeesterId = 1
                },
                new backend.Models.Veiling
                {
                    VeilingId = 2,
                    Naam = "Special Auction",
                    Image = "auction2.jpg",
                    Beschrijving = "Special auction description",
                    Locatie = "Naaldwijk",
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

        [TestMethod]
        public async Task Search_EmptyQuery_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.Search("");

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            Assert.AreEqual(0, results.Count);
        }

        [TestMethod]
        public async Task Search_NullQuery_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.Search(null);

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            Assert.AreEqual(0, results.Count);
        }

        [TestMethod]
        public async Task Search_ProductMatch_ReturnsMatchingProducts()
        {
            // Act
            var result = await _controller.Search("Test Product");

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            
            Assert.AreEqual(1, results.Count);
            Assert.AreEqual("Test Product 1", results[0].Naam);
            Assert.AreEqual("Product", results[0].Type);
            Assert.AreEqual("test1.jpg", results[0].Image);
        }

        [TestMethod]
        public async Task Search_AuctionMatch_ReturnsMatchingAuctions()
        {
            // Act
            var result = await _controller.Search("Special Auction");

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            
            Assert.AreEqual(1, results.Count);
            Assert.AreEqual("Special Auction", results[0].Naam);
            Assert.AreEqual("Veiling", results[0].Type);
            Assert.AreEqual("auction2.jpg", results[0].Image);
        }

        [TestMethod]
        public async Task Search_MultipleMatches_ReturnsAllMatches()
        {
            // Act
            var result = await _controller.Search("Test");

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            
            Assert.AreEqual(2, results.Count);
            Assert.IsTrue(results.Any(r => r.Naam == "Test Product 1" && r.Type == "Product"));
            Assert.IsTrue(results.Any(r => r.Naam == "Test Auction 1" && r.Type == "Veiling"));
        }

        [TestMethod]
        public async Task Search_CaseInsensitive_ReturnsMatches()
        {
            // Act
            var result = await _controller.Search("tEsT pRoDuCt");

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            
            Assert.AreEqual(1, results.Count);
            Assert.AreEqual("Test Product 1", results[0].Naam);
        }

        [TestMethod]
        public async Task Search_NoMatches_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.Search("Nonexistent");

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            Assert.AreEqual(0, results.Count);
        }
    }
}
