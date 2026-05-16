using DeepwokendleApi.Commands;
using DeepwokendleApi.Queries;

namespace DeepwokendleApi.Interfaces
{
    public interface IAttemptRepository
    {
        Task<StreakAttemptsQuery> GetStreakAsync(string username);
        Task<List<int>> GetAttemptedMonsterIdsAsync(string username);
        Task<int> InsertAttemptAsync(AttemptCommand attemptCommand);
        Task<bool?> UpdateIfCorrectAsync(string user, int monsterId);
        Task UpdateUserStreakAsync(string user);
        Task UpdateUserCurrStreakAsync(string user);
        Task<List<int>> GetCorrectlyGuessedMonsterIdsAsync(string username);
        Task<MonsterStatsQuery> GetMonsterStatsAsync(string username, int monsterId);
    }
}
