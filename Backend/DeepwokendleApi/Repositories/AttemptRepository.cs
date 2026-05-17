using Dapper;
using DeepwokendleApi.Commands;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Queries;
using Npgsql;
using System.Text;

namespace DeepwokendleApi.Repositories
{
    public class AttemptRepository : IAttemptRepository
    {
        private readonly IConfiguration _configuration;

        public AttemptRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<StreakAttemptsQuery> GetStreakAsync(string username)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = new StringBuilder();
            sql.AppendLine("select ");
            sql.AppendLine("    curr_streak as StreakAmmount,");
            sql.AppendLine("    (SELECT COUNT(*)");
            sql.AppendLine("        FROM attempts a");
            sql.AppendLine("        WHERE a.generated_monster_id = (");
            sql.AppendLine("            SELECT id");
            sql.AppendLine("            FROM generated_monster");
            sql.AppendLine("            WHERE user_at_creation = @User");
            sql.AppendLine("              AND completed = false");
            sql.AppendLine("            LIMIT 1");
            sql.AppendLine("        )");
            sql.AppendLine("        AND a.\"user\" = @User");
            sql.AppendLine("    ) as AttemptsAmount");
            sql.AppendLine("from users where username = @User");
            return await connection.QuerySingleAsync<StreakAttemptsQuery>(sql.ToString(), new { User = username });
        }

        public async Task<List<int>> GetAttemptedMonsterIdsAsync(string username)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"
                SELECT a.monster_id
                 FROM attempts a inner join generated_monster gm on gm.id = a.generated_monster_id
                WHERE ""user"" = @User and gm.completed = false
                ORDER BY a.id ASC;
            ";
            var monsterIds = await connection.QueryAsync<int>(sql, new { User = username });
            return monsterIds.ToList();
        }

        public async Task<int> InsertAttemptAsync(AttemptCommand attemptCommand)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = new StringBuilder();
            sql.AppendLine("INSERT INTO attempts (");
            sql.AppendLine("    monster_id, generated_monster_id,");
            sql.AppendLine("    \"user\", guess_date, infinite, correct");
            sql.AppendLine(")");
            sql.AppendLine("VALUES (");
            sql.AppendLine("    @MonsterId,");
            sql.AppendLine("    (");
            sql.AppendLine("        SELECT id");
            sql.AppendLine("        FROM generated_monster");
            sql.AppendLine("        WHERE user_at_creation = @User");
            sql.AppendLine("          AND completed = false");
            sql.AppendLine("    ),");
            sql.AppendLine("    @User,");
            sql.AppendLine("    @GuessDate,");
            sql.AppendLine("    @Infinite,");
            sql.AppendLine("    (");
            sql.AppendLine("        CASE");
            sql.AppendLine("            WHEN (");
            sql.AppendLine("                SELECT monster_id");
            sql.AppendLine("                FROM generated_monster");
            sql.AppendLine("                WHERE user_at_creation = @User");
            sql.AppendLine("                  AND completed = false");
            sql.AppendLine("            ) = @MonsterId");
            sql.AppendLine("            THEN true");
            sql.AppendLine("            ELSE false");
            sql.AppendLine("        END");
            sql.AppendLine("    )");
            sql.AppendLine(")");
            sql.AppendLine("RETURNING (");
            sql.AppendLine("    SELECT COUNT(*)");
            sql.AppendLine("    FROM attempts a");
            sql.AppendLine("    WHERE a.generated_monster_id = (");
            sql.AppendLine("        SELECT id");
            sql.AppendLine("        FROM generated_monster");
            sql.AppendLine("        WHERE user_at_creation = @User");
            sql.AppendLine("          AND completed = false");
            sql.AppendLine("        LIMIT 1");
            sql.AppendLine("    )");
            sql.AppendLine("    AND a.\"user\" = @User");
            sql.AppendLine(")");
            return await connection.QuerySingleAsync<int>(sql.ToString(), attemptCommand);
        }

        public async Task<bool?> UpdateIfCorrectAsync(string user, int monsterId)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = new StringBuilder();
            sql.AppendLine("update generated_monster set completed = (");
            sql.AppendLine("    case when monster_id = @MonsterId");
            sql.AppendLine("        then true");
            sql.AppendLine("        else false");
            sql.AppendLine("    end");
            sql.AppendLine(")");
            sql.AppendLine("where completed = false and user_at_creation = @User and monster_id = @MonsterId");
            sql.AppendLine("returning completed;");
            return await connection.ExecuteScalarAsync<bool?>(sql.ToString(), new { User = user, MonsterId = monsterId });
        }

        public async Task UpdateUserStreakAsync(string user)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync(@"
                UPDATE users
                SET curr_streak = curr_streak + 1,
                    max_streak = GREATEST(max_streak, curr_streak + 1)
                WHERE username = @User;", new { User = user });
        }

        public async Task UpdateUserCurrStreakAsync(string user)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync(@"
                UPDATE users SET curr_streak = 0 WHERE username = @User;
                UPDATE generated_monster SET completed = true WHERE user_at_creation = @User AND completed = false;",
                new { User = user });
        }

        public async Task<List<int>> GetCorrectlyGuessedMonsterIdsAsync(string username)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"SELECT DISTINCT monster_id FROM attempts WHERE ""user"" = @User AND correct = true";
            var ids = await connection.QueryAsync<int>(sql, new { User = username });
            return ids.ToList();
        }

        public async Task<MonsterStatsQuery> GetMonsterStatsAsync(string username, int monsterId)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"
                SELECT
                    COUNT(*) FILTER (WHERE correct = true)::int  AS CorrectCount,
                    COUNT(*) FILTER (WHERE correct = false)::int AS IncorrectCount
                FROM attempts
                WHERE ""user"" = @User AND monster_id = @MonsterId
            ";
            return await connection.QuerySingleAsync<MonsterStatsQuery>(sql, new { User = username, MonsterId = monsterId });
        }
    }
}
