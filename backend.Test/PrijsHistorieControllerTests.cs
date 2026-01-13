using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using backend.Controllers;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Test
{
    [TestClass]
    public class PrijsHistorieControllerTests
    {
        [TestMethod]
        public async Task GetHistory_ProductNaamNull_ReturnsBadRequest()
        {
            // create a minimal IConfiguration so PrijsHistorieService can be constructed
            var inMemorySettings = new Dictionary<string, string?> {
                {"ConnectionStrings:DefaultConnection", "Host=localhost;Username=user;Password=pass;Database=db"}
            };
            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            var service = new PrijsHistorieService(configuration);
            var controller = new PrijsHistorieController(service);

            var result = await controller.GetHistory(0, 0, string.Empty);
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }
    }
}
