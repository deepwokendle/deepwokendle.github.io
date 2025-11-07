using Microsoft.AspNetCore.SignalR;

namespace DeepwokendleApi.Hubs
{
    public class ChatHub : Hub
    {
        private const int MaxMessageLength = 200;

        public async Task SendMessage(string user, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return;
            if (message.Length > MaxMessageLength)
                return;
            message = message.Trim();
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
