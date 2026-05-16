using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;

public class LootService : ILootService
{
    private readonly ILootRepository _lootRepository;

    public LootService(ILootRepository lootRepository)
    {
        _lootRepository = lootRepository;
    }

    public Task AddLootToMonsterAsync(int monsterId, int lootId)
        => _lootRepository.AddLootToMonsterAsync(monsterId, lootId);

    public Task<IEnumerable<Loot>> GetAllLoot()
        => _lootRepository.GetAllLootAsync();

    public Task<IEnumerable<MonsterLoot>> GetAllMonsterLoot()
        => _lootRepository.GetAllMonsterLootAsync();

    public Task<IEnumerable<string>> GetLootsByMonsterIdAsync(int monsterId)
        => _lootRepository.GetLootsByMonsterIdAsync(monsterId);

    public Task RemoveLootFromMonsterAsync(int monsterId, int lootId)
        => _lootRepository.RemoveLootFromMonsterAsync(monsterId, lootId);

    public Task<Loot> CreateLootAsync(string name) => _lootRepository.CreateLootAsync(name);

    public Task DeleteLootAsync(int id) => _lootRepository.DeleteLootAsync(id);
}
