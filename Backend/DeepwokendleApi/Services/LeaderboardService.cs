using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Queries;

public class LeaderboardService : ILeaderboardService
{
    private readonly ILeaderboardRepository _leaderboardRepository;

    public LeaderboardService(ILeaderboardRepository leaderboardRepository)
    {
        _leaderboardRepository = leaderboardRepository;
    }

    public Task<List<LeaderboardQuery>> GetLeaderboardAsync()
        => _leaderboardRepository.GetLeaderboardAsync();

    public Task<List<MonthlyLeaderboardQuery>> GetMonthlyLeaderboardAsync()
        => _leaderboardRepository.GetMonthlyLeaderboardAsync();

    public Task<List<MonthlyLeaderboardQuery>> GetDailyLeaderboardAsync()
        => _leaderboardRepository.GetDailyLeaderboardAsync();
}
