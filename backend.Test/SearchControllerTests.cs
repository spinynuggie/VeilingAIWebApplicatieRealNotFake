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
    /// Tests for <see cref="backend.Controllers.SearchController"/> ensuring search queries return expected results.
    /// </summary>
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
                new ProductGegevens
                {
                    ProductId = 1,
                    ProductNaam = "Test Product 1",
                    Fotos = "test1.jpg",
                    ProductBeschrijving = "Test product description",
                    Hoeveelheid = 1,
                    StartPrijs = 1m,
                    EindPrijs = 1m,
                    Huidigeprijs = 1m,
                    VerkoperId = 1,
                    LocatieId = 1,
                    ProductSpecificaties = new List<ProductSpecificatie>()
                },
                new ProductGegevens
                {
                    ProductId = 2,
                    ProductNaam = "Another Product",
                    Fotos = "test2.jpg",
                    ProductBeschrijving = "Another product description",
                    Hoeveelheid = 2,
                    StartPrijs = 1m,
                    EindPrijs = 2m,
                    Huidigeprijs = 1m,
                    VerkoperId = 2,
                    LocatieId = 1,
                    ProductSpecificaties = new List<ProductSpecificatie>()
                }
            );

            // Add test auctions
            _context.Veiling.AddRange(
                new Veiling
                {
                    VeilingId = 1,
                    Naam = "Test Auction 1",
                    Image = "auction1.jpg",
                    Beschrijving = "Test auction description",
                    LocatieId = 1,
                    Starttijd = DateTimeOffset.Now,
                    Eindtijd = DateTimeOffset.Now.AddHours(2),
                    VeilingMeesterId = 1
                },
                new Veiling
                {
                    VeilingId = 2,
                    Naam = "Special Auction",
                    Image = "auction2.jpg",
                    Beschrijving = "Special auction description",
                    LocatieId = 2,
                    Starttijd = DateTimeOffset.Now,
                    Eindtijd = DateTimeOffset.Now.AddHours(2),
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
    /// Ensures an empty search query returns an empty list of results.
    /// </summary>
    [TestMethod]
    public async Task Search_EmptyQuery_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.Search(new SearchQueryDto { Query = "" });

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            Assert.AreEqual(0, results.Count);
        }

    /// <summary>
    /// Ensures a product search returns matching product results.
    /// </summary>
    [TestMethod]
    public async Task Search_ProductMatch_ReturnsMatchingProducts()
        {
            // Act
            var result = await _controller.Search(new SearchQueryDto { Query = "Test Product" });

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            
            Assert.AreEqual(1, results.Count);
            Assert.AreEqual("Test Product 1", results[0].Naam);
            Assert.AreEqual("Product", results[0].Type);
            Assert.AreEqual("test1.jpg", results[0].Image);
        }

    /// <summary>
    /// Ensures an auction search returns matching auction results.
    /// </summary>
    [TestMethod]
    public async Task Search_AuctionMatch_ReturnsMatchingAuctions()
        {
            // Act
            var result = await _controller.Search(new SearchQueryDto { Query = "Special Auction" });

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            
            Assert.AreEqual(1, results.Count);
            Assert.AreEqual("Special Auction", results[0].Naam);
            Assert.AreEqual("Veiling", results[0].Type);
            Assert.AreEqual("auction2.jpg", results[0].Image);
        }

    /// <summary>
    /// Ensures a query matching multiple entities returns all relevant results.
    /// </summary>
    [TestMethod]
    public async Task Search_MultipleMatches_ReturnsAllMatches()
        {
            // Act
            var result = await _controller.Search(new SearchQueryDto { Query = "Test" });

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            
            Assert.AreEqual(2, results.Count);
            Assert.IsTrue(results.Any(r => r.Naam == "Test Product 1" && r.Type == "Product"));
            Assert.IsTrue(results.Any(r => r.Naam == "Test Auction 1" && r.Type == "Veiling"));
        }

    /// <summary>
    /// Ensures a query with no matches returns an empty list.
    /// </summary>
    [TestMethod]
    public async Task Search_NoMatches_ReturnsEmptyList()
        {
            // Act
            var result = await _controller.Search(new SearchQueryDto { Query = "Nonexistent" });

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var okResult = result.Result as OkObjectResult;
            var results = okResult.Value as List<SearchResultDto>;
            Assert.AreEqual(0, results.Count);
        }
    }
}
