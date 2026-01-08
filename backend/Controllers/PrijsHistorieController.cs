using System.Threading.Tasks;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
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
        /// Get price history for a product.
        /// </summary>
        /// <param name="productId">The ID of the product</param>
        /// <param name="verkoperId">The seller's user ID</param>
        /// <param name="productNaam">The product name (for grouping similar items)</param>
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
