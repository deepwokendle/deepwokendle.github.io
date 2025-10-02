using Dapper;
using DeepwokendleApi.Commands;
using DeepwokendleApi.DTOS;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;
using System.Text;

public class MonsterService : IMonsterService
{
    private readonly IConfiguration _configuration;

    public MonsterService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<int> CreateMonsterAsync(MonsterCommand monsterCommand, string username)
    {
        using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        const string sql = @"
            INSERT INTO monster
                (name, picture, mainhabitat, humanoid, elementid, categoryid, pending, useratcreation)
            VALUES
                (@Name, @Picture, 'Test', @Humanoid, @ElementId, @CategoryId, true, @username)
            RETURNING id;
        ";
        return await conn.ExecuteScalarAsync<int>(sql, new
        {
            monsterCommand.Name,
            monsterCommand.Picture,
            monsterCommand.Humanoid,
            monsterCommand.ElementId,
            monsterCommand.CategoryId,
            username
        });
    }

    public async Task InsertMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId)
    {
        using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sqlBuilder = new StringBuilder();

        if (locationsId?.Count > 0)
        {
            sqlBuilder.AppendLine("INSERT INTO monster_location (monsterid, locationid) VALUES");
            sqlBuilder.AppendLine(string.Join(", ", locationsId.Select(id => $"({monsterId}, {id})")));
            sqlBuilder.AppendLine(";");
        }

        if (lootsId?.Count > 0)
        {
            sqlBuilder.AppendLine("INSERT INTO monster_loot (monsterid, lootid) VALUES");
            sqlBuilder.AppendLine(string.Join(", ", lootsId.Select(id => $"({monsterId}, {id})")));
            sqlBuilder.AppendLine(";");
        }

        var sql = sqlBuilder.ToString();
        await conn.ExecuteAsync(sql);
    }

    public async Task<IEnumerable<Monster>> GetAllMonstersAsync()
    {
        using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        const string sql = "SELECT id, name, picture, mainhabitat AS MainHabitat, humanoid, elementid AS ElementId, categoryid AS CategoryId FROM monster where pending = false";
        return await conn.QueryAsync<Monster>(sql);
    }

    public async Task<Monster> GetMonsterByIdAsync(int id)
    {
        using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        const string sql = @"
            SELECT id, name, picture, mainhabitat AS MainHabitat, humanoid, elementid AS ElementId, categoryid AS CategoryId
            FROM monster
            WHERE id = @Id;
        ";
        return await conn.QueryFirstOrDefaultAsync<Monster>(sql, new { Id = id });
    }

    public async Task<int?> GetDailyMonsterAsync()
    {
        using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();
        var today = DateTime.UtcNow.Date;
        const string selectSql = "SELECT monster_id FROM daily_monster WHERE created_at = @Today;";
        int? monsterId = await conn.QueryFirstOrDefaultAsync<int?>(selectSql, new { Today = today });

        if (monsterId == null)
        {
            const string randomSql = "SELECT id FROM monster WHERE PENDING IS FALSE ORDER BY RANDOM() LIMIT 1;";
            monsterId = await conn.QueryFirstAsync<int>(randomSql);
            const string insertSql = "INSERT INTO daily_monster (created_at, monster_id) VALUES (@Today, @MonsterId);";
            await conn.ExecuteAsync(insertSql, new { Today = today, MonsterId = monsterId });
        }

        return monsterId;
    }

    public async Task<int?> GetInfiniteMonsterAsync(string username)
    {
        using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        await conn.OpenAsync();
        var today = DateTime.UtcNow.Date;
        const string selectSql = "SELECT monster_id FROM generated_monster WHERE user_at_creation = @Username and completed = false;";
        int? monsterId = await conn.QueryFirstOrDefaultAsync<int?>(selectSql, new { Username = username});

        if (monsterId == null)
        {
            const string randomSql = "SELECT id FROM monster where pending = false ORDER BY RANDOM() LIMIT 1;";
            monsterId = await conn.QueryFirstAsync<int>(randomSql);
            const string insertSql = "INSERT INTO generated_monster (user_at_creation, monster_id, completed) VALUES (@Username, @MonsterId, false);";
            await conn.ExecuteAsync(insertSql, new { Username = username, MonsterId = monsterId });
        }

        return monsterId;
    }

    public async Task UpdateMonsterAsync(int id, MonsterCommand monsterCommand)
    {
        using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        const string sql = @"
            UPDATE monster
            SET
                name = @Name,
                picture = @Picture,
                mainhabitat = @MainHabitat,
                humanoid = @Humanoid,
                elementid = @ElementId,
                categoryid = @CategoryId
            WHERE id = @Id;
        ";
        monsterCommand.Id = id;
        await conn.ExecuteAsync(sql, monsterCommand);
    }

    public async Task DeleteMonsterAsync(int id)
    {
        using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        const string sql = "DELETE FROM monster WHERE id = @Id;";
        await conn.ExecuteAsync(sql, new { Id = id });
    }
}
