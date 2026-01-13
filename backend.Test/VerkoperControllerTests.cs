using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Controllers;
using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace backend.Test
{
    /// <summary>
    /// Tests for <see cref="backend.Controllers.VerkoperController"/> including seller lifecycle and owner-specific endpoints.
    /// </summary>
    [TestClass]
    public class VerkoperControllerTests
    {
        private AppDbContext _context;
        private VerkoperController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"VerkoperTestDb_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            SeedTestData();

            _controller = new VerkoperController(_context);
            _controller.ControllerContext.HttpContext = new DefaultHttpContext();
        }

        private void SetUser(int? gebruikerId)
        {
            var http = _controller.ControllerContext.HttpContext ?? new DefaultHttpContext();
            if (gebruikerId.HasValue)
            {
                var claims = new[] { new Claim(ClaimTypes.NameIdentifier, gebruikerId.Value.ToString()) };
                http.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
            }
            else
            {
                http.User = new ClaimsPrincipal(new ClaimsIdentity());
            }
            _controller.ControllerContext.HttpContext = http;
        }

        private void SeedTestData()
        {
            _context.Verkopers.AddRange(
                new Verkoper
                {
                    VerkoperId = 1,
                    KvkNummer = "KVK-1",
                    Bedrijfsgegevens = "Bedrijf 1",
                    Adresgegevens = "Adres 1",
                    FinancieleGegevens = "IBAN1",
                    GebruikerId = 10
                },
                new Verkoper
                {
                    VerkoperId = 2,
                    KvkNummer = "KVK-2",
                    Bedrijfsgegevens = "Bedrijf 2",
                    Adresgegevens = "Adres 2",
                    FinancieleGegevens = "IBAN2",
                    GebruikerId = 20
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
    /// Ensures GetVerkopers returns all sellers.
    /// </summary>
    [TestMethod]
    public async Task GetVerkopers_ReturnsAll()
        {
            var result = await _controller.GetVerkopers();
            var list = result.Value as List<Verkoper> ?? result.Value.ToList();
            Assert.AreEqual(2, list.Count);
        }

    /// <summary>
    /// Ensures GetVerkoper(id) returns the seller when found.
    /// </summary>
    [TestMethod]
    public async Task GetVerkoper_ById_Found()
        {
            var result = await _controller.GetVerkoper(1);
            Assert.IsNotNull(result.Value);
            Assert.AreEqual("KVK-1", result.Value.KvkNummer);
        }

    /// <summary>
    /// Ensures GetVerkoper returns NotFound for unknown ids.
    /// </summary>
    [TestMethod]
    public async Task GetVerkoper_ById_NotFound()
        {
            var result = await _controller.GetVerkoper(999);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Ensures GetMyVerkoper returns Unauthorized when no authenticated user.
    /// </summary>
    [TestMethod]
    public async Task GetMyVerkoper_Unauthorized_WhenNoUser()
        {
            SetUser(null);
            var result = await _controller.GetMyVerkoper();
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }

    /// <summary>
    /// Ensures GetMyVerkoper returns NotFound when the authenticated user has no seller record.
    /// </summary>
    [TestMethod]
    public async Task GetMyVerkoper_NotFound_WhenNoRecord()
        {
            SetUser(999);
            var result = await _controller.GetMyVerkoper();
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Ensures GetMyVerkoper returns the seller entity when present for the authenticated user.
    /// </summary>
    [TestMethod]
    public async Task GetMyVerkoper_Found_ReturnsEntity()
        {
            // Seed a verkoper for user 42
            _context.Verkopers.Add(new Verkoper
            {
                KvkNummer = "KVK-42",
                Bedrijfsgegevens = "B42",
                Adresgegevens = "A42",
                FinancieleGegevens = "IB42",
                GebruikerId = 42
            });
            _context.SaveChanges();

            SetUser(42);
            var result = await _controller.GetMyVerkoper();
            Assert.IsNotNull(result.Value);
            Assert.AreEqual("KVK-42", result.Value.KvkNummer);
        }

    /// <summary>
    /// Ensures UpsertMyVerkoper returns Unauthorized when no authenticated user is present.
    /// </summary>
    [TestMethod]
    public async Task UpsertMyVerkoper_Unauthorized_WhenNoUser()
        {
            SetUser(null);
            var dto = new VerkoperDto { KvkNummer = "K1", Bedrijfsgegevens = "B", Adresgegevens = "A", FinancieleGegevens = "F" };
            var result = await _controller.UpsertMyVerkoper(dto);
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }

    /// <summary>
    /// Ensures UpsertMyVerkoper creates a seller record when absent for the user.
    /// </summary>
    [TestMethod]
    public async Task UpsertMyVerkoper_Creates_WhenAbsent()
        {
            SetUser(77);
            var dto = new VerkoperDto { KvkNummer = "K77", Bedrijfsgegevens = "B77", Adresgegevens = "A77", FinancieleGegevens = "F77" };
            var result = await _controller.UpsertMyVerkoper(dto);

            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
            var created = result.Result as CreatedAtActionResult;
            Assert.IsInstanceOfType(created.Value, typeof(Verkoper));
            var entity = created.Value as Verkoper;
            Assert.AreEqual(77, entity.GebruikerId);

            var inDb = await _context.Verkopers.FirstOrDefaultAsync(v => v.GebruikerId == 77);
            Assert.IsNotNull(inDb);
            Assert.AreEqual("K77", inDb.KvkNummer);
        }

    /// <summary>
    /// Ensures UpsertMyVerkoper updates an existing seller for the user.
    /// </summary>
    [TestMethod]
    public async Task UpsertMyVerkoper_Updates_WhenExists()
        {
            // existing for user 10 from seed
            SetUser(10);
            var dto = new VerkoperDto { KvkNummer = "K10U", Bedrijfsgegevens = "B10U", Adresgegevens = "A10U", FinancieleGegevens = "F10U" };
            var result = await _controller.UpsertMyVerkoper(dto);

            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var ok = result.Result as OkObjectResult;
            var entity = ok.Value as Verkoper;
            Assert.AreEqual("K10U", entity.KvkNummer);

            var inDb = await _context.Verkopers.FindAsync(entity.VerkoperId);
            Assert.AreEqual("K10U", inDb.KvkNummer);
        }

    /// <summary>
    /// Ensures UpdateMyVerkoper returns Unauthorized when the request is unauthenticated.
    /// </summary>
    [TestMethod]
    public async Task UpdateMyVerkoper_Unauthorized_WhenNoUser()
        {
            SetUser(null);
            var dto = new VerkoperDto { KvkNummer = "K1" };
            var result = await _controller.UpdateMyVerkoper(dto);
            Assert.IsInstanceOfType(result, typeof(UnauthorizedResult));
        }

    /// <summary>
    /// Ensures UpdateMyVerkoper returns NotFound when the seller record for the user is absent.
    /// </summary>
    [TestMethod]
    public async Task UpdateMyVerkoper_NotFound_WhenAbsent()
        {
            SetUser(555);
            var dto = new VerkoperDto { KvkNummer = "K555" };
            var result = await _controller.UpdateMyVerkoper(dto);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Ensures UpdateMyVerkoper persists changes and returns NoContent on success.
    /// </summary>
    [TestMethod]
    public async Task UpdateMyVerkoper_Success_ReturnsNoContent()
        {
            _context.Verkopers.Add(new Verkoper
            {
                KvkNummer = "KVK-X",
                Bedrijfsgegevens = "BX",
                Adresgegevens = "AX",
                FinancieleGegevens = "FX",
                GebruikerId = 88
            });
            _context.SaveChanges();

            SetUser(88);
            var dto = new VerkoperDto { KvkNummer = "KVK-X2", Bedrijfsgegevens = "BX2", Adresgegevens = "AX2", FinancieleGegevens = "FX2" };
            var result = await _controller.UpdateMyVerkoper(dto);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            var inDb = await _context.Verkopers.FirstAsync(v => v.GebruikerId == 88);
            Assert.AreEqual("KVK-X2", inDb.KvkNummer);
        }

    /// <summary>
    /// Ensures posting a new Verkoper returns CreatedAtAction.
    /// </summary>
    [TestMethod]
    public async Task PostVerkoper_Creates_ReturnsCreatedAt()
        {
            var dto = new VerkoperDto { KvkNummer = "KNEW", Bedrijfsgegevens = "B", Adresgegevens = "A", FinancieleGegevens = "F" };
            var result = await _controller.PostVerkoper(dto);
            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
            var created = result.Result as CreatedAtActionResult;
            Assert.IsInstanceOfType(created.Value, typeof(Verkoper));
        }

    /// <summary>
    /// Ensures PutVerkoper returns NotFound for a missing seller id.
    /// </summary>
    [TestMethod]
    public async Task PutVerkoper_NotFound_ReturnsNotFound()
        {
            var dto = new VerkoperDto { KvkNummer = "K", Bedrijfsgegevens = "B", Adresgegevens = "A", FinancieleGegevens = "F" };
            var result = await _controller.PutVerkoper(999, dto);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

    /// <summary>
    /// Ensures PutVerkoper updates the seller entity and returns NoContent.
    /// </summary>
    [TestMethod]
    public async Task PutVerkoper_Updates_ReturnsNoContent()
        {
            var dto = new VerkoperDto { KvkNummer = "KVK-1U", Bedrijfsgegevens = "B1U", Adresgegevens = "A1U", FinancieleGegevens = "F1U" };
            var result = await _controller.PutVerkoper(1, dto);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));

            var updated = await _context.Verkopers.FindAsync(1);
            Assert.AreEqual("KVK-1U", updated.KvkNummer);
            Assert.AreEqual("B1U", updated.Bedrijfsgegevens);
            Assert.AreEqual("A1U", updated.Adresgegevens);
            Assert.AreEqual("F1U", updated.FinancieleGegevens);
        }

    /// <summary>
    /// Ensures deleting an existing seller returns NoContent and removes the record.
    /// </summary>
    [TestMethod]
    public async Task DeleteVerkoper_Existing_ReturnsNoContent()
        {
            var result = await _controller.DeleteVerkoper(1);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            Assert.IsNull(await _context.Verkopers.FindAsync(1));
        }

    /// <summary>
    /// Ensures deleting a non-existent seller returns NotFound.
    /// </summary>
    [TestMethod]
    public async Task DeleteVerkoper_NotFound_ReturnsNotFound()
        {
            var result = await _controller.DeleteVerkoper(999);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
    }
}

