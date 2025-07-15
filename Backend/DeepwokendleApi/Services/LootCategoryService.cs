using Dapper;
using DeepwokendleApi.Interfaces;
using Npgsql;
using System.Text;

public class LootCategoryService : ILootCategoryService
{
    private readonly IConfiguration _configuration;

    public LootCategoryService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task CreateLootCategoryAsync(string name)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        StringBuilder sql = new();
        sql.Append(@"INSERT INTO loot_category (name) VALUES(@Name)");
        await connection.ExecuteAsync(sql.ToString(), new { Name = name});
    }
}
