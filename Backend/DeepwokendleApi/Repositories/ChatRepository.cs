using Dapper;
using DeepwokendleApi.Interfaces;
using Npgsql;
using System.Data;

namespace DeepwokendleApi.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly IConfiguration _configuration;

        public ChatRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SaveMessageAsync(string externalId, string username, string message)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync(
                "INSERT INTO chat_message (external_id, username, message) VALUES (@ExternalId, @Username, @Message)",
                new { ExternalId = externalId, Username = username, Message = message });
        }

        public async Task<IEnumerable<ChatHistoryItem>> GetMessagesAsync(int skip, int take)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"
                SELECT external_id AS ExternalId, username AS Username, message AS Message
                FROM chat_message
                ORDER BY sent_at DESC
                LIMIT @Take OFFSET @Skip";
            var results = await connection.QueryAsync<ChatHistoryItem>(sql, new { Take = take, Skip = skip });
            return results.Reverse();
        }

        public async Task<bool> ReportMessageAsync(string externalId, string reportedBy)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var messageId = await connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT id FROM chat_message WHERE external_id = @ExternalId",
                new { ExternalId = externalId });

            if (messageId is null) return false;

            try
            {
                await connection.ExecuteAsync(
                    "INSERT INTO chat_report (message_id, reported_by) VALUES (@MessageId, @ReportedBy)",
                    new { MessageId = messageId, ReportedBy = reportedBy });
                return true;
            }
            catch
            {
                return false; // UNIQUE constraint = already reported by this user
            }
        }
    }
}
