using System.Threading.Tasks;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Controller voor het opvragen van historische prijsontwikkelingen van producten binnen het platform.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PrijsHistorieController : ControllerBase
    {
        private readonly PrijsHistorieService _service;

        public PrijsHistorieController(PrijsHistorieService service)
        {
            _service = service;
        }
        
        /// <summary>
        /// Haalt de prijshistorie op voor een specifiek product, gegroepeerd op naam en verkoper.
        /// </summary>
        /// <param name="productId">Het unieke ID van het huidige product.</param>
        /// <param name="verkoperId">Het ID van de verkoper om vergelijkbare producten van dezelfde aanbieder te vinden.</param>
        /// <param name="productNaam">De naam van het product om historische data van gelijknamige items te aggregeren.</param>
        /// <returns>Een lijst met historische prijspunten en datums.</returns>
        /// <response code="200">Historische gegevens succesvol opgehaald.</response>
        /// <response code="400">Verplichte parameters (zoals productNaam) ontbreken.</response>
        /// <response code="401">Gebruiker is niet geautoriseerd.</response>
        /// <response code="500">Interne serverfout bij het berekenen van de historie.</response>
        [Authorize(Roles = "VERKOPER,VEILINGMEESTER,ADMIN,KLANT")]
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetHistory(
            int productId,
            [FromQuery] int verkoperId,
            [FromQuery] string productNaam)
        {
            if (string.IsNullOrEmpty(productNaam))
                return BadRequest("productNaam is vereist.");

            var userRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;

            try
            {
                var result = await _service.GetHistorieAsync(productId, verkoperId, productNaam, userRole);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Return the actual error message for debugging (in dev environment)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
