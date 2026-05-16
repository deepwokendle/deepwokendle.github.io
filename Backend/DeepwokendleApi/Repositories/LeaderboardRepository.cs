using Dapper;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Queries;
using Npgsql;
using System.Text;

namespace DeepwokendleApi.Repositories
{
    public class LeaderboardRepository : ILeaderboardRepository
    {
        private readonly IConfiguration _configuration;

        public LeaderboardRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<LeaderboardQuery>> GetLeaderboardAsync()
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"
                SELECT 
                  ROW_NUMBER() OVER (ORDER BY max_streak DESC) AS Place,
                  username AS Username,
                  max_streak AS MaxStreak
                FROM users
                WHERE max_streak > 5
                ORDER BY max_streak DESC
                LIMIT 100;
            ";
            var results = await connection.QueryAsync<LeaderboardQuery>(sql);
            return [.. results];
        }

        public async Task<List<MonthlyLeaderboardQuery>> GetMonthlyLeaderboardAsync()
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"
                SELECT
                  ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS Place,
                  a.""user"" AS Username,
                  COUNT(*)::int AS Score
                FROM attempts a
                WHERE a.correct = true
                  AND a.infinite = true
                  AND DATE_TRUNC('month', a.guess_date) = DATE_TRUNC('month', CURRENT_DATE)
                GROUP BY a.""user""
                ORDER BY Score DESC
                LIMIT 100;
            ";
            var results = await connection.QueryAsync<MonthlyLeaderboardQuery>(sql);
            return [.. results];
        }

        public async Task<List<MonthlyLeaderboardQuery>> GetDailyLeaderboardAsync()
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"
                SELECT
                  ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS Place,
                  a.""user"" AS Username,
                  COUNT(*)::int AS Score
                FROM attempts a
                WHERE a.correct = true
                  AND a.infinite = true
                  AND a.guess_date = CURRENT_DATE
                GROUP BY a.""user""
                ORDER BY Score DESC
                LIMIT 100;
            ";
            var results = await connection.QueryAsync<MonthlyLeaderboardQuery>(sql);
            return [.. results];
        }
    }
}
