using Dapper;
using DeepwokendleApi.Commands;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using DeepwokendleApi.Queries;
using Npgsql;
using System.Collections.Generic;
using System.Text;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

public class AttemptService : IAttemptService
{
    private readonly IConfiguration _configuration;

    public AttemptService(IConfiguration configuration)
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
        return await connection.QuerySingleAsync<StreakAttemptsQuery>(sql.ToString(), new { User = username});
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

    public async Task<int> InsertAttempt(AttemptCommand attemptCommand)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        attemptCommand.GuessDate = DateTime.UtcNow.Date;
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

    public async Task<bool> UpdateIfCorrect(string user, int monsterId)
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
        var result = await connection.ExecuteScalarAsync<bool?>(sql.ToString(), new { User = user, MonsterId = @monsterId});
        return result ?? false;
    }

    public async Task UpdateUserStreak(string user)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.AppendLine("UPDATE users");
        sql.AppendLine("SET");
        sql.AppendLine("    curr_streak = curr_streak + 1,");
        sql.AppendLine("    max_streak = GREATEST(max_streak, curr_streak + 1)");
        sql.AppendLine("WHERE username = @User;");
        await Task.FromResult(connection.Execute(sql.ToString(), new { User = user }));
    }

    public async Task UpdateUserCurrStreak(string user)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.AppendLine("UPDATE users");
        sql.AppendLine("SET");
        sql.AppendLine("    curr_streak = 0");
        sql.AppendLine("WHERE username = @User;");
        sql.AppendLine("UPDATE generated_monster");
        sql.AppendLine("SET");
        sql.AppendLine("    completed = true");
        sql.AppendLine("WHERE user_at_creation = @User and completed = false;");
        await Task.FromResult(connection.Execute(sql.ToString(), new { User = user }));
    }
}
