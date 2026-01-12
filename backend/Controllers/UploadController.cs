using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Controller voor het afhandelen van bestands-uploads naar de lokale serveropslag.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        /// <summary>
        /// Uploadt een bestand naar de server en retourneert de publiek toegankelijke URL.
        /// </summary>
        /// <param name="file">Het bestand dat via een multipart/form-data request wordt verstuurd.</param>
        /// <returns>Een JSON-object met de relatieve URL naar het opgeslagen bestand.</returns>
        /// <response code="200">Bestand succesvol geüpload en opgeslagen.</response>
        /// <response code="400">Bestand ontbreekt of is leeg.</response>
        /// <response code="500">Fout bij het wegschrijven van het bestand naar de servermap.</response>
        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Geen bestand geupload.");

            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename to prevent overwrites
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL
            var url = $"/uploads/{uniqueFileName}";
            return Ok(new { url });
        }
    }
}
