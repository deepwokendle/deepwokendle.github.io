using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface IUserService
    {
        Task<bool> UserExists(string username);
        Task<string> CreateUser(string username, string password);
        Task<User> GetByUsername(string username);
    }
}
