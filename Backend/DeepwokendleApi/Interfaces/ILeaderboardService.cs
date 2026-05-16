using DeepwokendleApi.Models;
using DeepwokendleApi.Queries;

namespace DeepwokendleApi.Interfaces
{
    public interface ILeaderboardService
    {
        Task<List<LeaderboardQuery>> GetLeaderboardAsync();
        Task<List<MonthlyLeaderboardQuery>> GetMonthlyLeaderboardAsync();
        Task<List<MonthlyLeaderboardQuery>> GetDailyLeaderboardAsync();
    }
}
