using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Services;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace DeepwokendleApi.Hubs
{
    public class ChatHub : Hub
    {
        private const int MaxMessageLength = 200;
        private readonly IChatRepository _chatRepository;
        private readonly ChatRateLimiter _rateLimiter;

        public ChatHub(IChatRepository chatRepository, ChatRateLimiter rateLimiter)
        {
            _chatRepository = chatRepository;
            _rateLimiter = rateLimiter;
        }

        public async Task SendMessage(string user, string message)
        {
            var username = Context.User?.FindFirst(ClaimTypes.Name)?.Value
                ?? Context.User?.FindFirst("unique_name")?.Value
                ?? Context.User?.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                await Clients.Caller.SendAsync("Unauthorized", "You must be logged in to send messages.");
                return;
            }

            if (string.IsNullOrWhiteSpace(message)) return;
            if (message.Length > MaxMessageLength) return;
            message = message.Trim();

            if (!_rateLimiter.IsAllowed(username))
            {
                await Clients.Caller.SendAsync("RateLimited", "You're sending messages too fast. Please wait a moment.");
                return;
            }

            var externalId = Guid.NewGuid().ToString();
            await Clients.All.SendAsync("ReceiveMessage", externalId, username, message);
            _ = Task.Run(() => _chatRepository.SaveMessageAsync(externalId, username, message));
        }
    }
}
