using DeepwokendleApi.Interfaces;

public class LootCategoryService : ILootCategoryService
{
    private readonly ILootCategoryRepository _lootCategoryRepository;

    public LootCategoryService(ILootCategoryRepository lootCategoryRepository)
    {
        _lootCategoryRepository = lootCategoryRepository;
    }

    public Task CreateLootCategoryAsync(string name)
        => _lootCategoryRepository.CreateLootCategoryAsync(name);
}
