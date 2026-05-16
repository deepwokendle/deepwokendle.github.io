using Dapper;
using DeepwokendleApi.Interfaces;
using Npgsql;

namespace DeepwokendleApi.Repositories
{
    public class LootCategoryRepository : ILootCategoryRepository
    {
        private readonly IConfiguration _configuration;

        public LootCategoryRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task CreateLootCategoryAsync(string name)
        {
            using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = @"INSERT INTO loot_category (name) VALUES(@Name)";
            await connection.ExecuteAsync(sql, new { Name = name });
        }
    }
}
