using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> UserExistsAsync(string username);
        Task CreateUserAsync(string username, string passwordHash);
        Task<User> GetByUsernameAsync(string username);
    }
}
