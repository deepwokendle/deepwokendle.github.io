using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface IElementRepository
    {
        Task AddElementToMonsterAsync(int monsterId, int elementId);
        Task<IEnumerable<Element>> GetElementsAsync();
        Task<IEnumerable<Element>> GetElementsByIdsAsync(List<int> elementsIds);
        Task<IEnumerable<string>> GetElementsByMonsterIdAsync(int monsterId);
        Task RemoveElementsFromMonsterAsync(int monsterId, int elementId);
    }
}
