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
            const string sql = "SELECT id, name, picture, mainhabitat AS MainHabitat, humanoid, elementid AS ElementId, categoryid AS CategoryId, useratcreation AS UserAtCreation FROM monster where pending = false";
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
                       elementid AS ElementId, categoryid AS CategoryId, pending,
                       useratcreation AS UserAtCreation
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

        public async Task<(IEnumerable<MonsterSuggestion> Items, int Total)> GetPendingSuggestionsAsync(
            int page, int pageSize, string sort, string username, string search = "")
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));

            var orderBy = sort switch
            {
                "dislikes" => "COALESCE(v.dislike_count, 0) DESC, COALESCE(v.like_count, 0) ASC, m.id DESC",
                "recent"   => "m.id DESC",
                _          => "COALESCE(v.like_count, 0) DESC, COALESCE(v.dislike_count, 0) ASC, m.id DESC",
            };

            var hasSearch = !string.IsNullOrWhiteSpace(search);
            var searchFilter = hasSearch
                ? "AND (m.name ILIKE @SearchPattern OR m.useratcreation ILIKE @SearchPattern)"
                : string.Empty;

            var sql = $@"
                SELECT
                    m.id             AS Id,
                    m.name           AS Name,
                    m.picture        AS Picture,
                    m.humanoid       AS Humanoid,
                    m.pending        AS Pending,
                    m.useratcreation AS UserAtCreation,
                    m.created_at     AS CreatedAt,
                    m.updated_at     AS UpdatedAt,
                    e.name           AS Element,
                    c.name           AS Category,
                    (SELECT COALESCE(string_agg(l.name, ',' ORDER BY l.name), '')
                     FROM monster_loot ml JOIN loot l ON l.id = ml.lootid
                     WHERE ml.monsterid = m.id)   AS Loots,
                    (SELECT COALESCE(string_agg(loc.name, ',' ORDER BY loc.name), '')
                     FROM monster_location mloc JOIN location loc ON loc.id = mloc.locationid
                     WHERE mloc.monsterid = m.id) AS Locations,
                    COALESCE(v.like_count, 0)    AS LikeCount,
                    COALESCE(v.dislike_count, 0) AS DislikeCount,
                    uv.vote AS UserVote,
                    (SELECT COALESCE(string_agg(vl.username, ',' ORDER BY vl.username), '')
                     FROM (SELECT username FROM monster_vote WHERE monster_id = m.id AND vote = 1 ORDER BY username LIMIT 3) vl) AS LastLikers,
                    (SELECT COALESCE(string_agg(vd.username, ',' ORDER BY vd.username), '')
                     FROM (SELECT username FROM monster_vote WHERE monster_id = m.id AND vote = -1 ORDER BY username LIMIT 3) vd) AS LastDislikers
                FROM monster m
                JOIN element e  ON e.id = m.elementid
                JOIN category c ON c.id = m.categoryid
                LEFT JOIN (
                    SELECT monster_id,
                           COUNT(CASE WHEN vote = 1  THEN 1 END)::int AS like_count,
                           COUNT(CASE WHEN vote = -1 THEN 1 END)::int AS dislike_count
                    FROM monster_vote GROUP BY monster_id
                ) v ON v.monster_id = m.id
                LEFT JOIN (
                    SELECT monster_id, COUNT(*)::int AS report_count
                    FROM monster_report GROUP BY monster_id
                ) r ON r.monster_id = m.id
                LEFT JOIN (
                    SELECT monster_id, vote FROM monster_vote WHERE username = @Username
                ) uv ON uv.monster_id = m.id
                WHERE m.pending = true
                  AND COALESCE(r.report_count, 0) < 5
                  {searchFilter}
                ORDER BY {orderBy}
                LIMIT @PageSize OFFSET @Offset;
            ";

            var countSql = $@"
                SELECT COUNT(*)::int
                FROM monster m
                LEFT JOIN (
                    SELECT monster_id, COUNT(*)::int AS report_count
                    FROM monster_report GROUP BY monster_id
                ) r ON r.monster_id = m.id
                WHERE m.pending = true
                  AND COALESCE(r.report_count, 0) < 5
                  {searchFilter};
            ";

            var queryParams = new
            {
                Username = username ?? string.Empty,
                PageSize = pageSize,
                Offset = (page - 1) * pageSize,
                SearchPattern = hasSearch ? $"%{search}%" : string.Empty,
            };

            var rows = await conn.QueryAsync<MonsterSuggestionRow>(sql, queryParams);
            var total = await conn.ExecuteScalarAsync<int>(countSql, queryParams);

            var items = rows.Select(r => new MonsterSuggestion
            {
                Id             = r.Id,
                Name           = r.Name,
                Picture        = r.Picture,
                Humanoid       = r.Humanoid,
                Pending        = r.Pending,
                UserAtCreation = r.UserAtCreation,
                CreatedAt      = r.CreatedAt,
                UpdatedAt      = r.UpdatedAt,
                Element        = r.Element,
                Category       = r.Category,
                Loots          = r.Loots.Length > 0 ? [.. r.Loots.Split(',')] : [],
                Locations      = r.Locations.Length > 0 ? [.. r.Locations.Split(',')] : [],
                LikeCount      = r.LikeCount,
                DislikeCount   = r.DislikeCount,
                UserVote       = r.UserVote,
                LastLikers     = r.LastLikers.Length > 0 ? [.. r.LastLikers.Split(',')] : [],
                LastDislikers  = r.LastDislikers.Length > 0 ? [.. r.LastDislikers.Split(',')] : [],
            });

            return (items, total);
        }

        public async Task<IEnumerable<MonsterSuggestion>> GetUserSuggestionsAsync(string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = @"
                SELECT
                    m.id             AS Id,
                    m.name           AS Name,
                    m.picture        AS Picture,
                    m.humanoid       AS Humanoid,
                    m.pending        AS Pending,
                    m.useratcreation AS UserAtCreation,
                    m.created_at     AS CreatedAt,
                    m.updated_at     AS UpdatedAt,
                    e.name           AS Element,
                    c.name           AS Category,
                    (SELECT COALESCE(string_agg(l.name, ',' ORDER BY l.name), '')
                     FROM monster_loot ml JOIN loot l ON l.id = ml.lootid
                     WHERE ml.monsterid = m.id)   AS Loots,
                    (SELECT COALESCE(string_agg(loc.name, ',' ORDER BY loc.name), '')
                     FROM monster_location mloc JOIN location loc ON loc.id = mloc.locationid
                     WHERE mloc.monsterid = m.id) AS Locations,
                    COALESCE(v.like_count, 0)    AS LikeCount,
                    COALESCE(v.dislike_count, 0) AS DislikeCount,
                    uv.vote AS UserVote,
                    (SELECT COALESCE(string_agg(vl.username, ',' ORDER BY vl.username), '')
                     FROM (SELECT username FROM monster_vote WHERE monster_id = m.id AND vote = 1 ORDER BY username LIMIT 3) vl) AS LastLikers,
                    (SELECT COALESCE(string_agg(vd.username, ',' ORDER BY vd.username), '')
                     FROM (SELECT username FROM monster_vote WHERE monster_id = m.id AND vote = -1 ORDER BY username LIMIT 3) vd) AS LastDislikers
                FROM monster m
                JOIN element e  ON e.id = m.elementid
                JOIN category c ON c.id = m.categoryid
                LEFT JOIN (
                    SELECT monster_id,
                           COUNT(CASE WHEN vote = 1  THEN 1 END)::int AS like_count,
                           COUNT(CASE WHEN vote = -1 THEN 1 END)::int AS dislike_count
                    FROM monster_vote GROUP BY monster_id
                ) v ON v.monster_id = m.id
                LEFT JOIN (
                    SELECT monster_id, vote FROM monster_vote WHERE username = @Username
                ) uv ON uv.monster_id = m.id
                WHERE m.useratcreation = @Username
                ORDER BY m.id DESC;
            ";

            var rows = await conn.QueryAsync<MonsterSuggestionRow>(sql, new { Username = username });
            return rows.Select(r => new MonsterSuggestion
            {
                Id             = r.Id,
                Name           = r.Name,
                Picture        = r.Picture,
                Humanoid       = r.Humanoid,
                Pending        = r.Pending,
                UserAtCreation = r.UserAtCreation,
                CreatedAt      = r.CreatedAt,
                UpdatedAt      = r.UpdatedAt,
                Element        = r.Element,
                Category       = r.Category,
                Loots          = r.Loots.Length > 0 ? [.. r.Loots.Split(',')] : [],
                Locations      = r.Locations.Length > 0 ? [.. r.Locations.Split(',')] : [],
                LikeCount      = r.LikeCount,
                DislikeCount   = r.DislikeCount,
                UserVote       = r.UserVote,
                LastLikers     = r.LastLikers.Length > 0 ? [.. r.LastLikers.Split(',')] : [],
                LastDislikers  = r.LastDislikers.Length > 0 ? [.. r.LastDislikers.Split(',')] : [],
            });
        }

        public async Task SetMonsterVoteAsync(int monsterId, string username, int vote)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = @"
                INSERT INTO monster_vote (monster_id, username, vote)
                VALUES (@MonsterId, @Username, @Vote)
                ON CONFLICT (monster_id, username) DO UPDATE SET vote = @Vote;
            ";
            await conn.ExecuteAsync(sql, new { MonsterId = monsterId, Username = username, Vote = vote });
        }

        public async Task RemoveMonsterVoteAsync(int monsterId, string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await conn.ExecuteAsync(
                "DELETE FROM monster_vote WHERE monster_id = @MonsterId AND username = @Username;",
                new { MonsterId = monsterId, Username = username });
        }

        public async Task ReportMonsterAsync(int monsterId, string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await conn.ExecuteAsync(
                "INSERT INTO monster_report (monster_id, username) VALUES (@MonsterId, @Username) ON CONFLICT DO NOTHING;",
                new { MonsterId = monsterId, Username = username });
        }

        public async Task<int> CreateUserSuggestionAsync(MonsterCommand cmd, string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = @"
                INSERT INTO monster (name, picture, mainhabitat, humanoid, elementid, categoryid, pending, useratcreation, created_at)
                VALUES (@Name, @Picture, '', @Humanoid, @ElementId, @CategoryId, true, @Username, NOW())
                RETURNING id;
            ";
            return await conn.ExecuteScalarAsync<int>(sql, new
            {
                cmd.Name, cmd.Picture, cmd.Humanoid, cmd.ElementId, cmd.CategoryId, Username = username
            });
        }

        public async Task<bool> UpdateUserSuggestionAsync(int id, MonsterCommand cmd, string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            const string sql = @"
                UPDATE monster
                SET name       = @Name,
                    picture    = @Picture,
                    humanoid   = @Humanoid,
                    elementid  = @ElementId,
                    categoryid = @CategoryId,
                    updated_at = NOW()
                WHERE id = @Id AND useratcreation = @Username AND pending = true;
            ";
            var rows = await conn.ExecuteAsync(sql, new
            {
                Id = id, cmd.Name, cmd.Picture, cmd.Humanoid, cmd.ElementId, cmd.CategoryId, Username = username
            });
            return rows > 0;    
        }

        public async Task<bool> DeleteUserSuggestionAsync(int id, string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();
            using var tx = await conn.BeginTransactionAsync();

            var exists = await conn.ExecuteScalarAsync<bool>(
                "SELECT EXISTS(SELECT 1 FROM monster WHERE id = @Id AND useratcreation = @Username AND pending = true);",
                new { Id = id, Username = username }, tx);

            if (!exists)
            {
                await tx.RollbackAsync();
                return false;
            }

            await conn.ExecuteAsync("DELETE FROM monster_loot     WHERE monsterid = @Id;", new { Id = id }, tx);
            await conn.ExecuteAsync("DELETE FROM monster_location  WHERE monsterid = @Id;", new { Id = id }, tx);
            await conn.ExecuteAsync(
                "DELETE FROM monster WHERE id = @Id AND useratcreation = @Username AND pending = true;",
                new { Id = id, Username = username }, tx);

            await tx.CommitAsync();
            return true;
        }

        public async Task<Monster?> GetUserSuggestionEnrichedAsync(int id, string username)
        {
            using var conn = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var monster = await conn.QueryFirstOrDefaultAsync<Monster>(
                @"SELECT id, name, picture, mainhabitat AS MainHabitat, humanoid, elementid AS ElementId, categoryid AS CategoryId
                  FROM monster WHERE id = @Id AND useratcreation = @Username AND pending = true",
                new { Id = id, Username = username });
            if (monster == null) return null;
            monster.Element = await conn.QueryFirstOrDefaultAsync<Element>(
                "SELECT id, name FROM element WHERE id = @Id", new { Id = monster.ElementId });
            monster.Category = await conn.QueryFirstOrDefaultAsync<Category>(
                "SELECT id, name FROM category WHERE id = @Id", new { Id = monster.CategoryId });
            monster.LootPool = await conn.QueryAsync<MonsterLoot>(
                "SELECT ml.monsterid AS MonsterId, ml.lootid AS LootId, l.name AS LootName FROM monster_loot ml JOIN loot l ON l.id = ml.lootid WHERE ml.monsterid = @Id",
                new { Id = id });
            monster.LocationPool = await conn.QueryAsync<MonsterLocation>(
                "SELECT ml.monsterid AS MonsterId, ml.locationid AS LocationId, loc.name AS Name FROM monster_location ml JOIN location loc ON loc.id = ml.locationid WHERE ml.monsterid = @Id",
                new { Id = id });
            return monster;
        }
    }
}
