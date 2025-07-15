using Dapper;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;
using System.Text;

public class ElementService : IElementService
{
    private readonly IConfiguration _configuration;

    public ElementService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task AddElementToMonsterAsync(int monsterId, int ElementId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append("INSERT INTO monster_element (monsterId, ElementId) VALUES (@MonsterId, @ElementId) ON CONFLICT DO NOTHING");
        await connection.ExecuteAsync(sql.ToString(), new { MonsterId = monsterId, ElementId = ElementId });
    }

    public async Task<IEnumerable<Element>> GetElements()
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = @"
            SELECT e.id, e.name
            FROM element e
        ";
        return await connection.QueryAsync<Element>(sql.ToString());
    }
    
    public async Task<IEnumerable<Element>> GetElementsByIdsAsync(List<int> elementsIds)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = @"
            SELECT e.id, e.name
            FROM element e
            WHERE e.Id = ANY(@ElementsIds)
        ";
        return await connection.QueryAsync<Element>(sql.ToString(), new { ElementsIds = elementsIds });
    }
    
    public async Task<IEnumerable<string>> GetElementsByMonsterIdAsync(int monsterId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append(@"
            SELECT l.name
            FROM Element l
            JOIN monster_element ml ON l.id = ml.ElementId
            WHERE ml.monsterId = @MonsterId
        ");
        return await connection.QueryAsync<string>(sql.ToString(), new { MonsterId = monsterId });
    }

    public async Task RemoveElementsFromMonsterAsync(int monsterId, int ElementId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append("DELETE FROM monster_element WHERE monsterId = @MonsterId AND ElementId = @ElementId");
        await connection.ExecuteAsync(sql.ToString(), new { MonsterId = monsterId, ElementId = ElementId });
    }
}
