namespace DeepwokendleApi.Interfaces
{
    public record ChatHistoryItem(string ExternalId, string Username, string Message);

    public interface IChatRepository
    {
        Task SaveMessageAsync(string externalId, string username, string message);
        Task<bool> ReportMessageAsync(string externalId, string reportedBy);
        Task<IEnumerable<ChatHistoryItem>> GetMessagesAsync(int skip, int take);
    }
}
