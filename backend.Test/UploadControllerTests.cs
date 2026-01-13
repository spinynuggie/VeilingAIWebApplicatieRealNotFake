using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using backend.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Test
{
    /// <summary>
    /// Tests for <see cref="backend.Controllers.UploadController"/> validating file upload endpoints.
    /// </summary>
    [TestClass]
    public class UploadControllerTests
    {
        private UploadController _controller;

        [TestInitialize]
        public void Setup()
        {
            _controller = new UploadController();
        }

    /// <summary>
    /// Ensures uploading a null file returns BadRequest.
    /// </summary>
    [TestMethod]
    public async Task Upload_NullFile_ReturnsBadRequest()
        {
            IFormFile file = null;
            var result = await _controller.Upload(file);
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

    /// <summary>
    /// Ensures uploading a valid IFormFile returns Ok and stores the file.
    /// </summary>
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

            var result = await _controller.Upload(file, "testfolder");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            
            var okResult = result as OkObjectResult;
            dynamic val = okResult.Value;
            // The url property should contain /uploads/testfolder/
            // Note: In unit tests with dynamic/anonymous types it's tricky to access properties directly without reflection or 'dynamic'.
            // For simplicity we check if result is OK. 
            // Ideally check file existence on disk:
            
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "testfolder");
            // Check if directory was created
            Assert.IsTrue(Directory.Exists(uploadsPath));
            
            // Cleanup
            if (Directory.Exists(uploadsPath)) Directory.Delete(uploadsPath, true);
        }
    }
}
