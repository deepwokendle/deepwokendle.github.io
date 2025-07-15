using Dapper;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;
using Npgsql;

public class UserService : IUserService
{
    private readonly IConfiguration _configuration;

    public UserService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<bool> UserExists(string username)
    {
        using var db = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = "SELECT 1 FROM Users WHERE Username = @Username";
        return await db.ExecuteScalarAsync<int?>(sql, new { username }) != null;
    }

    public async Task<string> CreateUser(string username, string password)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        using var db = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = "INSERT INTO Users (Username, PasswordHash) VALUES (@Username, @Hash)";
        await db.ExecuteAsync(sql, new { Username = username, Hash = hash });
        return username;
    }

    public async Task<User> GetByUsername(string username)
    {
        using var db = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnection"));
        var sql = "SELECT * FROM Users WHERE Username = @Username";
        return await db.QueryFirstOrDefaultAsync<User>(sql, new { username });
    }
}
