using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public Task<bool> UserExists(string username)
        => _userRepository.UserExistsAsync(username);

    public async Task<string> CreateUser(string username, string password)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        await _userRepository.CreateUserAsync(username, hash);
        return username;
    }

    public Task<User> GetByUsername(string username)
        => _userRepository.GetByUsernameAsync(username);
}
