using DeepwokendleApi.Queries;

namespace DeepwokendleApi.Interfaces
{
    public interface ILeaderboardRepository
    {
        Task<List<LeaderboardQuery>> GetLeaderboardAsync();
        Task<List<MonthlyLeaderboardQuery>> GetMonthlyLeaderboardAsync();
        Task<List<MonthlyLeaderboardQuery>> GetDailyLeaderboardAsync();
    }
}
