using Dapper;
using Npgsql;
using DeepwokendleApi.Interfaces;
using System.Text;
using DeepwokendleApi.Models;

public class CategoryService : ICategoryService
{
    private readonly IConfiguration _configuration;

    public CategoryService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SetCategoryOnMonsterAsync(int monsterId, int categoryId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append("UPDATE monster ");
        sql.Append("SET category_id = @CategoryId ");
        sql.Append("WHERE id = @MonsterId");
        await connection.ExecuteAsync(sql.ToString(), new { MonsterId = monsterId, CategoryId = categoryId });
    }

    public async Task<string> GetCategoryByMonsterIdAsync(int monsterId)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = new StringBuilder();
        sql.Append(@"
            SELECT c.name
            FROM category c
            JOIN monster m ON c.id = m.category_id
            WHERE m.id = @MonsterId
        ");
        return await connection.QueryFirstOrDefaultAsync<string>(sql.ToString(), new { MonsterId = monsterId });
    }
    public async Task<IEnumerable<Category>> GetCategories()
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = @"
            SELECT c.id, c.name
            FROM category c
        ";
        return await connection.QueryAsync<Category>(sql.ToString());
    }
    public async Task<IEnumerable<Category>> GetCategoriesByIdAsync(List<int> categoriesIds)
    {
        using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = @"
            SELECT c.id, c.name
            FROM category c
            WHERE c.Id = ANY(@CategoriesIds)
        ";
        return await connection.QueryAsync<Category>(sql.ToString(), new { CategoriesIds = categoriesIds });
    }
}
