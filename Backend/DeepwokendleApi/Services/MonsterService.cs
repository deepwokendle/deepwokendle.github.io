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
        const string sql = "SELECT id, name, picture, mainhabitat AS MainHabitat, humanoid, elementid AS ElementId, categoryid AS CategoryId FROM monster WHERE pending is false;";
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
