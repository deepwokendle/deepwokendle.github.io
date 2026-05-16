using DeepwokendleApi.Commands;
using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface IMonsterRepository
    {
        Task<int> CreateMonsterAsync(MonsterCommand monsterCommand, string username);
        Task InsertMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId);
        Task<IEnumerable<Monster>> GetAllMonstersAsync();
        Task<Monster> GetMonsterByIdAsync(int id);
        Task<int?> GetDailyMonsterIdAsync(DateTime today);
        Task InsertDailyMonsterAsync(DateTime today, int monsterId);
        Task<int> GetRandomMonsterIdAsync();
        Task<int?> GetIncompleteGeneratedMonsterIdByUserAsync(string username);
        Task InsertGeneratedMonsterAsync(string username, int monsterId);
        Task<Monster> GetEnrichedMonsterAsync(int id);
        Task UpdateMonsterAsync(int id, MonsterCommand monsterCommand);
        Task UpdateMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId);
        Task DeleteMonsterAsync(int id);
        Task DeleteMonstersAsync(List<int> ids);
        Task<IEnumerable<Monster>> GetAllMonstersAdminAsync();
        Task<int> AdminCreateMonsterAsync(MonsterCommand monsterCommand, string username);
        Task PublishMonsterAsync(int id);
    }
}
