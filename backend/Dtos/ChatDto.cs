namespace backend.Dtos
{
    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ChatBotResponse
    {
        public string Response { get; set; } = string.Empty;
        public string? Action { get; set; } // e.g. "navigate", "bid"
        public string? Data { get; set; }
    }
}
