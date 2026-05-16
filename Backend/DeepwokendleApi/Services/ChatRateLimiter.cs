using System.Collections.Concurrent;

namespace DeepwokendleApi.Services
{
    public class ChatRateLimiter
    {
        private readonly ConcurrentDictionary<string, Queue<DateTimeOffset>> _windows = new();
        private const int MaxMessages = 3;
        private static readonly TimeSpan Window = TimeSpan.FromSeconds(3);

        public bool IsAllowed(string username)
        {
            var now = DateTimeOffset.UtcNow;
            var queue = _windows.GetOrAdd(username, _ => new Queue<DateTimeOffset>());
            lock (queue)
            {
                while (queue.Count > 0 && now - queue.Peek() > Window)
                    queue.Dequeue();
                if (queue.Count >= MaxMessages)
                    return false;
                queue.Enqueue(now);
                return true;
            }
        }
    }
}
