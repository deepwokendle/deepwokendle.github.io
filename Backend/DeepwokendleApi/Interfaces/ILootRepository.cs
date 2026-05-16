using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface ILootRepository
    {
        Task AddLootToMonsterAsync(int monsterId, int lootId);
        Task<IEnumerable<Loot>> GetAllLootAsync();
        Task<IEnumerable<MonsterLoot>> GetAllMonsterLootAsync();
        Task<IEnumerable<string>> GetLootsByMonsterIdAsync(int monsterId);
        Task RemoveLootFromMonsterAsync(int monsterId, int lootId);
        Task<Loot> CreateLootAsync(string name);
        Task DeleteLootAsync(int id);
        Task<IEnumerable<Loot>> GetPlayerLootOptionsAsync(string username);
        Task<Loot> CreatePlayerLootAsync(string name, string username);
    }
}
