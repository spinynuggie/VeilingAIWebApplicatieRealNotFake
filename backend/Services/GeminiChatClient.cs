using Microsoft.Extensions.AI;
using System.Text.Json;
using System.Text;

namespace backend.Services
{
    public class GeminiChatClient : IChatClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;

        public GeminiChatClient(HttpClient httpClient, string apiKey, string model = "gemini-1.5-flash")
        {
            _httpClient = httpClient;
            _apiKey = apiKey;
            _model = model;
        }

        public ChatClientMetadata Metadata => new ChatClientMetadata("Gemini", new Uri("https://generativelanguage.googleapis.com"));

        public async Task<ChatCompletion> CompleteAsync(IList<ChatMessage> chatMessages, ChatOptions? options = null, CancellationToken cancellationToken = default)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

            var contents = chatMessages.Select(m => new
            {
                role = m.Role == ChatRole.User ? "user" : "model",
                parts = new[] { new { text = m.Text } }
            }).ToArray();

            var requestBody = new { contents };
            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return new ChatCompletion(new ChatMessage(ChatRole.Assistant, text ?? ""));
        }

        public IAsyncEnumerable<StreamingChatCompletionUpdate> CompleteStreamingAsync(IList<ChatMessage> chatMessages, ChatOptions? options = null, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException("Streaming not implemented in this simple version.");
        }

        public TService? GetService<TService>(object? serviceKey = null) where TService : class => this as TService;

        public void Dispose() { }
    }
}
