using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface ICategoryRepository
    {
        Task SetCategoryOnMonsterAsync(int monsterId, int categoryId);
        Task<string> GetCategoryByMonsterIdAsync(int monsterId);
        Task<IEnumerable<Category>> GetCategoriesAsync();
        Task<IEnumerable<Category>> GetCategoriesByIdsAsync(List<int> categoriesIds);
    }
}
