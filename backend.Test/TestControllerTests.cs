using System.Reflection;
using Backend.Controllers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace backend.Test
{
    [TestClass]
    public class TestControllerTests
    {
        private TestController _controller;

        [TestInitialize]
        public void Setup()
        {
            _controller = new TestController();
        }

        [TestMethod]
        public void Put_ReturnsOkWithTestModel()
        {
            var result = _controller.GetTest();

            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            var ok = result as OkObjectResult;
            Assert.IsInstanceOfType(ok.Value, typeof(TestModel));

            var model = ok.Value as TestModel;
            Assert.AreEqual(1, model.Id);
            Assert.AreEqual("Joe", model.TestName);
        }

        [TestMethod]
        public void Post_EchoesTestName()
        {
            var input = new TestModel { Id = 7, TestName = "Alice" };

            var result = _controller.PostTest(input);

            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            var ok = result as OkObjectResult;

            // The controller returns an anonymous type { received = model.TestName }
            var value = ok.Value;
            Assert.IsNotNull(value);
            var prop = value.GetType().GetProperty("received", BindingFlags.Public | BindingFlags.Instance);
            Assert.IsNotNull(prop);
            var received = prop.GetValue(value) as string;
            Assert.AreEqual("Alice", received);
        }
    }
}
