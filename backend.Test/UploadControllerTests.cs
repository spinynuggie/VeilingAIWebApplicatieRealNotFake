using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using backend.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Test
{
    [TestClass]
    public class UploadControllerTests
    {
        private UploadController _controller;

        [TestInitialize]
        public void Setup()
        {
            _controller = new UploadController();
        }

        [TestMethod]
        public async Task Upload_NullFile_ReturnsBadRequest()
        {
            IFormFile file = null;
            var result = await _controller.Upload(file);
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task Upload_ValidFile_ReturnsOk()
        {
            var content = "Hello world from tests";
            var fileName = "testfile.txt";

            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            writer.Write(content);
            writer.Flush();
            stream.Position = 0;

            IFormFile file = new FormFile(stream, 0, stream.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "text/plain"
            };

            var result = await _controller.Upload(file);
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            // cleanup created file if any
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", fileName);
            if (File.Exists(uploadPath)) File.Delete(uploadPath);
        }
    }
}
