namespace DeepwokendleApi.Interfaces
{
    public interface ILootCategoryRepository
    {
        Task CreateLootCategoryAsync(string name);
    }
}
