using DeepwokendleApi.Models;
using DeepwokendleApi.Queries;

namespace DeepwokendleApi.Interfaces
{
    public interface ILeaderboardService
    {
        Task<List<LeaderboardQuery>> GetLeaderboardAsync();
    }
}
