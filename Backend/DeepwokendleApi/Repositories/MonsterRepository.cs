using Dapper;
using DeepwokendleApi.Commands;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;
using System.Text;

namespace DeepwokendleApi.Repositories
{
    public class MonsterRepository : IMonsterRepository
    {
        private readonly IConfiguration _configuration;

        public MonsterRepository(IConfiguration configuration)
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
                    (@Name, @Picture, @MainHabitat, @Humanoid, @ElementId, @CategoryId, true, @username)
                RETURNING id;
            ";
            return await conn.ExecuteScalarAsync<int>(sql, new
            {
                monsterCommand.Name,
                monsterCommand.Picture,
                MainHabitat = monsterCommand.MainHabitat ?? string.Empty,
                monsterCommand.Humanoid,
                monsterCommand.ElementId,
                monsterCommand.CategoryId,
                username
            });
        }

        public async Task<int> AdminCreateMonsterAsync(MonsterCommand monsterCommand, string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = @"
                INSERT INTO monster
                    (name, picture, mainhabitat, humanoid, elementid, categoryid, pending, useratcreation)
                VALUES
                    (@Name, @Picture, @MainHabitat, @Humanoid, @ElementId, @CategoryId, false, @username)
                RETURNING id;
            ";
            return await conn.ExecuteScalarAsync<int>(sql, new
            {
                monsterCommand.Name,
                monsterCommand.Picture,
                MainHabitat = monsterCommand.MainHabitat ?? string.Empty,
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

        public async Task<int?> GetDailyMonsterIdAsync(DateTime today)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = "SELECT monster_id FROM daily_monster WHERE created_at = @Today;";
            return await conn.QueryFirstOrDefaultAsync<int?>(sql, new { Today = today });
        }

        public async Task InsertDailyMonsterAsync(DateTime today, int monsterId)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = "INSERT INTO daily_monster (created_at, monster_id) VALUES (@Today, @MonsterId);";
            await conn.ExecuteAsync(sql, new { Today = today, MonsterId = monsterId });
        }

        public async Task<int> GetRandomMonsterIdAsync()
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = "SELECT id FROM monster WHERE PENDING IS FALSE ORDER BY RANDOM() LIMIT 1;";
            return await conn.QueryFirstAsync<int>(sql);
        }

        public async Task<int?> GetIncompleteGeneratedMonsterIdByUserAsync(string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = "SELECT monster_id FROM generated_monster WHERE user_at_creation = @Username and completed = false;";
            return await conn.QueryFirstOrDefaultAsync<int?>(sql, new { Username = username });
        }

        public async Task InsertGeneratedMonsterAsync(string username, int monsterId)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = "INSERT INTO generated_monster (user_at_creation, monster_id, completed) VALUES (@Username, @MonsterId, false);";
            await conn.ExecuteAsync(sql, new { Username = username, MonsterId = monsterId });
        }

        public async Task<Monster> GetEnrichedMonsterAsync(int id)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var monster = await conn.QueryFirstOrDefaultAsync<Monster>(
                "SELECT id, name, picture, mainhabitat AS MainHabitat, humanoid, elementid AS ElementId, categoryid AS CategoryId FROM monster WHERE id = @Id",
                new { Id = id });
            if (monster == null) return null;
            monster.Element = await conn.QueryFirstOrDefaultAsync<Element>("SELECT id, name FROM element WHERE id = @Id", new { Id = monster.ElementId });
            monster.Category = await conn.QueryFirstOrDefaultAsync<Category>("SELECT id, name FROM category WHERE id = @Id", new { Id = monster.CategoryId });
            monster.LootPool = await conn.QueryAsync<MonsterLoot>(
                "SELECT ml.monsterid AS MonsterId, ml.lootid AS LootId, l.name AS LootName FROM monster_loot ml JOIN loot l ON l.id = ml.lootid WHERE ml.monsterid = @Id",
                new { Id = id });
            monster.LocationPool = await conn.QueryAsync<MonsterLocation>(
                "SELECT ml.monsterid AS MonsterId, ml.locationid AS LocationId, loc.name AS Name FROM monster_location ml JOIN location loc ON loc.id = ml.locationid WHERE ml.monsterid = @Id",
                new { Id = id });
            return monster;
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

        public async Task DeleteMonstersAsync(List<int> ids)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await conn.ExecuteAsync("DELETE FROM monster WHERE id = ANY(@Ids);", new { Ids = ids.ToArray() });
        }

        public async Task<IEnumerable<Monster>> GetAllMonstersAdminAsync()
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = @"
                SELECT id, name, picture, mainhabitat AS MainHabitat, humanoid,
                       elementid AS ElementId, categoryid AS CategoryId, pending
                FROM monster
                ORDER BY id;
            ";
            return await conn.QueryAsync<Monster>(sql);
        }

        public async Task UpdateMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await conn.ExecuteAsync("DELETE FROM monster_location WHERE monsterid = @Id;", new { Id = monsterId });
            await conn.ExecuteAsync("DELETE FROM monster_loot WHERE monsterid = @Id;", new { Id = monsterId });
            await InsertMonsterRelationsAsync(monsterId, locationsId, lootsId);
        }

        public async Task PublishMonsterAsync(int id)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await conn.ExecuteAsync("UPDATE monster SET pending = false WHERE id = @Id;", new { Id = id });
        }
    }
}
