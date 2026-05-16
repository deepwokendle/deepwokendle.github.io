using Dapper;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;
using System.Text;

namespace DeepwokendleApi.Repositories
{
    public class LootRepository : ILootRepository
    {
        private readonly IConfiguration _configuration;

        public LootRepository(IConfiguration configuration)
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

        public async Task<IEnumerable<Loot>> GetAllLootAsync()
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"SELECT id, name from loot;";
            return await connection.QueryAsync<Loot>(sql);
        }

        public async Task<IEnumerable<MonsterLoot>> GetAllMonsterLootAsync()
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"SELECT ml.MonsterId, ml.LootId, l.Name AS LootName
                     FROM monster_loot ml
                     INNER JOIN loot l ON l.Id = ml.LootId";
            return await connection.QueryAsync<MonsterLoot>(sql);
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

        public async Task<Loot> CreateLootAsync(string name)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            return await connection.QuerySingleAsync<Loot>(
                "INSERT INTO loot (name) VALUES (@Name) RETURNING id, name",
                new { Name = name });
        }

        public async Task DeleteLootAsync(int id)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync("DELETE FROM loot WHERE id = @Id", new { Id = id });
        }

        public async Task<IEnumerable<Loot>> GetPlayerLootOptionsAsync(string username)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            return await connection.QueryAsync<Loot>(
                @"SELECT id, name FROM loot
                  WHERE created_by_player = false
                     OR (created_by_player = true AND user_at_creation = @Username)
                  ORDER BY name;",
                new { Username = username });
        }

        public async Task<Loot> CreatePlayerLootAsync(string name, string username)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            return await connection.QuerySingleAsync<Loot>(
                @"INSERT INTO loot (name, created_by_player, user_at_creation)
                  VALUES (@Name, true, @Username)
                  RETURNING id, name;",
                new { Name = name, Username = username });
        }
    }
}
