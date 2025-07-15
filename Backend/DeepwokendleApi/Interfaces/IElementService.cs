using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface IElementService
    {
        Task AddElementToMonsterAsync(int monsterId, int ElementId);
        Task<IEnumerable<Element>> GetElements();
        Task<IEnumerable<Element>> GetElementsByIdsAsync(List<int> elementsIds);
        Task<IEnumerable<string>> GetElementsByMonsterIdAsync(int monsterId);
        Task RemoveElementsFromMonsterAsync(int monsterId, int ElementId);
    }
}
