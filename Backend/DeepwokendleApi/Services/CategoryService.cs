using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public Task SetCategoryOnMonsterAsync(int monsterId, int categoryId)
        => _categoryRepository.SetCategoryOnMonsterAsync(monsterId, categoryId);

    public Task<string> GetCategoryByMonsterIdAsync(int monsterId)
        => _categoryRepository.GetCategoryByMonsterIdAsync(monsterId);

    public Task<IEnumerable<Category>> GetCategories()
        => _categoryRepository.GetCategoriesAsync();

    public Task<IEnumerable<Category>> GetCategoriesByIdAsync(List<int> categoriesIds)
        => _categoryRepository.GetCategoriesByIdsAsync(categoriesIds);
}
