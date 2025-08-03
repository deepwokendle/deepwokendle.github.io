using DeepwokendleApi.Commands;
using DeepwokendleApi.Models;
using DeepwokendleApi.Queries;
using Microsoft.Extensions.Primitives;

namespace DeepwokendleApi.Interfaces
{
    public interface IAttemptService
    {
        Task<StreakAttemptsQuery> GetStreakAsync(string username);
        Task<List<int>> GetAttemptedMonsterIdsAsync(string username);
        Task<int> InsertAttempt(AttemptCommand attemptCommand);
        Task<bool> UpdateIfCorrect(string user, int monsterId);
        Task UpdateUserStreak(string user);
        Task UpdateUserCurrStreak(string user);
    }
}
