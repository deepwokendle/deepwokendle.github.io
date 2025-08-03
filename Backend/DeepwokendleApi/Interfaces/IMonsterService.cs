using DeepwokendleApi.Commands;
using DeepwokendleApi.Models;
using Microsoft.Extensions.Primitives;

namespace DeepwokendleApi.Interfaces
{
    public interface IMonsterService
    {
        Task<int> CreateMonsterAsync(MonsterCommand dto, string username);
        Task InsertMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId);
        Task<IEnumerable<Monster>> GetAllMonstersAsync();
        Task<Monster> GetMonsterByIdAsync(int id);
        Task<int?> GetDailyMonsterAsync();
        Task<int?> GetInfiniteMonsterAsync(string username);
        Task UpdateMonsterAsync(int id, MonsterCommand dto);
        Task DeleteMonsterAsync(int id);
    }

}
