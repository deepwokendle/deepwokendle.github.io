using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface ICategoryService
    {
        Task SetCategoryOnMonsterAsync(int monsterId, int categoryId);
        Task<string> GetCategoryByMonsterIdAsync(int monsterId);
        Task<IEnumerable<Category>> GetCategories();
        Task<IEnumerable<Category>> GetCategoriesByIdAsync(List<int> categoriesIds);
    }
}
