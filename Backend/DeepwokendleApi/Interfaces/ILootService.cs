using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface ILootService
    {
        Task AddLootToMonsterAsync(int monsterId, int lootId);
        Task<IEnumerable<Loot>> GetAllLoot();
        Task<IEnumerable<MonsterLoot>> GetAllMonsterLoot();
        Task<IEnumerable<string>> GetLootsByMonsterIdAsync(int monsterId);
        Task RemoveLootFromMonsterAsync(int monsterId, int lootId);
    }
}
