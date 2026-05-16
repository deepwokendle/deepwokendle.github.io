using Dapper;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;
using System.Text;

namespace DeepwokendleApi.Repositories
{
    public class LocationRepository : ILocationRepository
    {
        private readonly IConfiguration _configuration;

        public LocationRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task AddLocationToMonsterAsync(int monsterId, int locationId)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = new StringBuilder();
            sql.Append("INSERT INTO monster_location (monsterId, locationId) VALUES (@MonsterId, @LocationId) ON CONFLICT DO NOTHING");
            await connection.ExecuteAsync(sql.ToString(), new { MonsterId = monsterId, LocationId = locationId });
        }

        public async Task<IEnumerable<string>> GetLocationsByMonsterIdAsync(int monsterId)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = new StringBuilder();
            sql.Append(@"
                SELECT l.name
                FROM location l
                JOIN monster_location ml ON l.id = ml.locationId
                WHERE ml.monsterId = @MonsterId
            ");
            return await connection.QueryAsync<string>(sql.ToString(), new { MonsterId = monsterId });
        }

        public async Task<IEnumerable<Location>> GetAllLocationsAsync()
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"SELECT id, name from location;";
            return await connection.QueryAsync<Location>(sql);
        }

        public async Task<IEnumerable<MonsterLocation>> GetAllMonsterLocationAsync()
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"
                SELECT
                    ml.monsterid AS MonsterId,
                    ml.locationid AS LocationId,
                    l.name AS Name
                FROM monster_location ml
                INNER JOIN location l ON l.id = ml.locationId
            ";
            return await connection.QueryAsync<MonsterLocation>(sql);
        }

        public async Task RemoveLocationsFromMonsterAsync(int monsterId, int locationId)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = new StringBuilder();
            sql.Append("DELETE FROM monster_location WHERE monsterId = @MonsterId AND locationId = @LocationId");
            await connection.ExecuteAsync(sql.ToString(), new { MonsterId = monsterId, LocationId = locationId });
        }

        public async Task<Location> CreateLocationAsync(string name)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            return await connection.QuerySingleAsync<Location>(
                "INSERT INTO location (name) VALUES (@Name) RETURNING id, name",
                new { Name = name });
        }

        public async Task DeleteLocationAsync(int id)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync("DELETE FROM location WHERE id = @Id", new { Id = id });
        }
    }
}
