using Dapper;
using Npgsql;
using DeepwokendleApi.Interfaces;
using System.Text;
using DeepwokendleApi.Models;
using DeepwokendleApi.Queries;

public class LeaderboardService : ILeaderboardService
{
    private readonly IConfiguration _configuration;

    public LeaderboardService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<List<LeaderboardQuery>> GetLeaderboardAsync()
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append(@"
            SELECT
              ROW_NUMBER() OVER (ORDER BY max_streak DESC) AS Place,
              username as Username,
              max_streak as MaxStreak
            FROM users
            ORDER BY max_streak DESC;
        ");
        var results = await connection.QueryAsync<LeaderboardQuery>(sql.ToString());
        return results.ToList();
    }
}
