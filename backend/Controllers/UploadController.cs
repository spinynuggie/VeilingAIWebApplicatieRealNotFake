using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    /// <summary>
    /// Controller voor het afhandelen van bestands-uploads naar de lokale serveropslag.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IFileService _fileService;

        public UploadController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string folder = "misc")
        {
            try
            {
                var url = await _fileService.SaveFileAsync(file, folder);
                return Ok(new { url });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "Fout bij het wegschrijven van het bestand naar de server.");
            }
        }
    }
}
