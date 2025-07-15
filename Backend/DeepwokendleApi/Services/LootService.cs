using Dapper;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;
using System.Text;

public class LootService : ILootService
{
    private readonly IConfiguration _configuration;

    public LootService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task AddLootToMonsterAsync(int monsterId, int lootId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append("INSERT INTO monster_loot (monsterId, lootId) VALUES (@MonsterId, @LootId) ON CONFLICT DO NOTHING");
        await connection.ExecuteAsync(sql.ToString(), new { MonsterId = monsterId, LootId = lootId });
    }

    public async Task<IEnumerable<Loot>> GetAllLoot()
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append(@"SELECT id, name from loot;");
        return await connection.QueryAsync<Loot>(sql.ToString());
    }

    public async Task<IEnumerable<MonsterLoot>> GetAllMonsterLoot()
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append(@"SELECT ml.MonsterId, ml.LootId, l.Name AS LootName 
                 FROM monster_loot ml 
                 INNER JOIN loot l ON l.Id = ml.LootId");
        return await connection.QueryAsync<MonsterLoot>(sql.ToString());
    }
    public async Task<IEnumerable<string>> GetLootsByMonsterIdAsync(int monsterId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append(@"
            SELECT l.name
            FROM loot l
            JOIN monster_loot ml ON l.id = ml.lootId
            WHERE ml.monsterId = @MonsterId
        ");
        return await connection.QueryAsync<string>(sql.ToString(), new { MonsterId = monsterId });
    }

    public async Task RemoveLootFromMonsterAsync(int monsterId, int lootId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append("DELETE FROM monster_loot WHERE monsterId = @MonsterId AND lootId = @LootId");
        await connection.ExecuteAsync(sql.ToString(), new { MonsterId = monsterId, LootId = lootId });
    }
}
