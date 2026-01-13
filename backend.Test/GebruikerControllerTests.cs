using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Controllers;
using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace backend.Test
{
    [TestClass]
    public class GebruikerControllerTests
    {
        private AppDbContext _context;
        private GebruikerController _controller;
        private PasswordHasher _hasher;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: $"GebruikerTestDb_{Guid.NewGuid()}")
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            _hasher = new PasswordHasher();

            // minimal configuration for JWT key used by the controller
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = "test-secret-key-which-is-long-enough",
                    ["Jwt:Issuer"] = "VeilingAI",
                    ["Jwt:Audience"] = "VeilingAIUsers"
                })
                .Build();

            var logger = new LoggerFactory().CreateLogger<GebruikerController>();

            // seed a user
            var existing = new Gebruiker
            {
                GebruikerId = 1,
                Emailadres = "existing@example.com",
                Wachtwoord = _hasher.Hash("password123"),
                Naam = "Existing User",
                Role = "KOPER"
            };
            _context.Gebruikers.Add(existing);
            _context.SaveChanges();

            _controller = new GebruikerController(_context, _hasher, logger, config);
            _controller.ControllerContext.HttpContext = new DefaultHttpContext();
        }

        [TestCleanup]
        public void Cleanup()
        {
            _context.Dispose();
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

        [TestMethod]
        public async Task PostGebruiker_Creates_ReturnsCreatedAt()
        {
            var dto = new GebruikerCreateDto { Emailadres = "new@example.com", Wachtwoord = "pw" };
            var result = await _controller.PostGebruiker(dto);

            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
            var created = result.Result as CreatedAtActionResult;
            Assert.IsNotNull(created);
            var inDb = await _context.Gebruikers.FirstOrDefaultAsync(g => g.Emailadres == "new@example.com");
            Assert.IsNotNull(inDb);
        }

        [TestMethod]
        public async Task Register_CreatesAndReturnsAuth()
        {
            var req = new RegisterRequestDto { Emailadres = "reg@example.com", Wachtwoord = "pw" };
            var result = await _controller.Register(req);

            Assert.IsInstanceOfType(result.Result, typeof(CreatedAtActionResult));
            var created = result.Result as CreatedAtActionResult;
            Assert.IsNotNull(created);
            Assert.IsInstanceOfType(created.Value, typeof(Dtos.AuthResponseDto));
        }

        [TestMethod]
        public async Task Login_Success_ReturnsOk()
        {
            var dto = new LoginRequestDto { Emailadres = "existing@example.com", Wachtwoord = "password123" };
            var result = await _controller.Login(dto);

            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var ok = result.Result as OkObjectResult;
            Assert.IsNotNull(ok?.Value);
        }

        [TestMethod]
        public async Task Login_WrongPassword_ReturnsUnauthorized()
        {
            var dto = new LoginRequestDto { Emailadres = "existing@example.com", Wachtwoord = "wrong" };
            var result = await _controller.Login(dto);

            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task GetCurrentUser_Unauthorized_WhenNoClaim()
        {
            SetUser(null);
            var result = await _controller.GetCurrentUser();
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }

        [TestMethod]
        public async Task GetCurrentUser_Success_ReturnsDto()
        {
            SetUser(1);
            var result = await _controller.GetCurrentUser();
            Assert.IsNotNull(result.Value);
            Assert.AreEqual("existing@example.com", result.Value.Emailadres);
        }

        [TestMethod]
        public async Task UpdateRole_Unauthorized_WhenNoClaim()
        {
            SetUser(null);
            var dto = new RoleUpdateDto { Role = "VERKOPER" };
            var result = await _controller.UpdateRole(1, dto);
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }

        [TestMethod]
        public async Task UpdateRole_Forbid_WhenDifferentUser()
        {
            SetUser(2);
            var dto = new RoleUpdateDto { Role = "VERKOPER" };
            var result = await _controller.UpdateRole(1, dto);
            Assert.IsInstanceOfType(result.Result, typeof(ForbidResult));
        }

        [TestMethod]
        public async Task UpdateRole_BadRequest_WhenInvalidRole()
        {
            SetUser(1);
            var dto = new RoleUpdateDto { Role = "INVALID" };
            var result = await _controller.UpdateRole(1, dto);
            Assert.IsInstanceOfType(result.Result, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task UpdateRole_Success_UpdatesRole()
        {
            SetUser(1);
            var dto = new RoleUpdateDto { Role = "VEILINGMEESTER" };
            var result = await _controller.UpdateRole(1, dto);

            Assert.IsNotNull(result.Value);
            Assert.AreEqual("VEILINGMEESTER", result.Value.Role);
        }

        [TestMethod]
        public async Task DeleteGebruiker_Forbid_WhenDifferentUser()
        {
            SetUser(2);
            var result = await _controller.DeleteGebruiker(1);
            Assert.IsInstanceOfType(result, typeof(ForbidResult));
        }

        [TestMethod]
        public async Task DeleteGebruiker_Success_RemovesEntity()
        {
            SetUser(1);
            var result = await _controller.DeleteGebruiker(1);
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            var inDb = await _context.Gebruikers.FindAsync(1);
            Assert.IsNull(inDb);
        }

        [TestMethod]
        public async Task Refresh_Unauthorized_WhenNoCookie()
        {
            var result = await _controller.Refresh();
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }

        [TestMethod]
        public async Task Refresh_Success_ReturnsOk()
        {
            // create refresh token entity for existing user
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            var rt = new RefreshToken
            {
                GebruikerId = 1,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddDays(1)
            };
            _context.RefreshTokens.Add(rt);
            _context.SaveChanges();

            // set cookie header so Request.Cookies can read it
            _controller.ControllerContext.HttpContext.Request.Headers["Cookie"] = $"refresh_token={token}";

            var result = await _controller.Refresh();
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var ok = result.Result as OkObjectResult;
            Assert.IsNotNull(ok?.Value);
        }
    }
}
