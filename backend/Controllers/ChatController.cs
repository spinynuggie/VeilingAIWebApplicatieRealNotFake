using backend.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatClient _chatClient;

        public ChatController([FromKeyedServices("Gemini")] IChatClient chatClient)
        {
            _chatClient = chatClient;
        }

        [HttpPost]
        public async Task<IActionResult> GetResponse([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Bericht mag niet leeg zijn.");

            try
            {
                var prompt = $@"
Je bent de ondersteunende AI van een bloemenveiling platform genaamd 'Veiling AI'. 
Je helpt gebruikers met vragen over hoe het platform werkt, welke veilingen er zijn en hoe ze kunnen bieden.
Houd je antwoorden kort, vriendelijk en behulpzaam.

Gebruiker zegt: {request.Message}";

                var response = await _chatClient.CompleteAsync(prompt);
                
                return Ok(new ChatBotResponse 
                { 
                    Response = response.Message.Text ?? "Sorry, ik kon geen antwoord genereren." 
                });
            }
            catch (Exception ex)
            {
                // Detailed error for debugging
                return StatusCode(500, new { 
                    error = "Chat server error", 
                    message = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }
    }
}
