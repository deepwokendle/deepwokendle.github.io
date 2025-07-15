using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
