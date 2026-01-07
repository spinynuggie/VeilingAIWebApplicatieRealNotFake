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
        [Authorize(Roles = "VERKOPER,VEILINGMEESTER,ADMIN")]
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetHistory(
            int productId,
            [FromQuery] int verkoperId,
            [FromQuery] string productNaam)
        {
            if (string.IsNullOrEmpty(productNaam))
                return BadRequest("productNaam is vereist.");

            var result = await _service.GetHistorieAsync(productId, verkoperId, productNaam);
            return Ok(result);
        }
    }
}
