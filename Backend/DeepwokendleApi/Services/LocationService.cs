using Dapper;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;
using System.Text;

public class LocationService : ILocationService
{
    private readonly IConfiguration _configuration;

    public LocationService(IConfiguration configuration)
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

    public async Task<IEnumerable<Location>> GetAllLocations()
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append(@"SELECT id, name from location;");
        return await connection.QueryAsync<Location>(sql.ToString());
    }

    public async Task<IEnumerable<MonsterLocation>> GetAllMonsterLocation()
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append(@"
            SELECT 
                ml.monsterid AS MonsterId,
                ml.locationid AS LocationId,
                l.name AS Name
            FROM monster_location ml 
            INNER JOIN location l ON l.id = ml.locationId
        ");

        return await connection.QueryAsync<MonsterLocation>(sql.ToString());
    }

    public async Task RemoveLocationsFromMonsterAsync(int monsterId, int locationId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append("DELETE FROM monster_location WHERE monsterId = @MonsterId AND locationId = @LocationId");
        await connection.ExecuteAsync(sql.ToString(), new { MonsterId = monsterId, LocationId = locationId });
    }
}
