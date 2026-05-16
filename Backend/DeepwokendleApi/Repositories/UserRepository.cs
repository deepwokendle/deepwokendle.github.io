using Dapper;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;

namespace DeepwokendleApi.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IConfiguration _configuration;

        public UserRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> UserExistsAsync(string username)
        {
            using var db = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = "SELECT 1 FROM Users WHERE Username = @Username";
            return await db.ExecuteScalarAsync<int?>(sql, new { Username = username }) != null;
        }

        public async Task CreateUserAsync(string username, string passwordHash)
        {
            using var db = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = "INSERT INTO Users (Username, PasswordHash) VALUES (@Username, @Hash)";
            await db.ExecuteAsync(sql, new { Username = username, Hash = passwordHash });
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            using var db = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            var sql = "SELECT * FROM Users WHERE Username = @Username";
            return await db.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
        }
    }
}
