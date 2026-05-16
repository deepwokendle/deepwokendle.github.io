using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;

public class ElementService : IElementService
{
    private readonly IElementRepository _elementRepository;

    public ElementService(IElementRepository elementRepository)
    {
        _elementRepository = elementRepository;
    }

    public Task AddElementToMonsterAsync(int monsterId, int ElementId)
        => _elementRepository.AddElementToMonsterAsync(monsterId, ElementId);

    public Task<IEnumerable<Element>> GetElements()
        => _elementRepository.GetElementsAsync();

    public Task<IEnumerable<Element>> GetElementsByIdsAsync(List<int> elementsIds)
        => _elementRepository.GetElementsByIdsAsync(elementsIds);

    public Task<IEnumerable<string>> GetElementsByMonsterIdAsync(int monsterId)
        => _elementRepository.GetElementsByMonsterIdAsync(monsterId);

    public Task RemoveElementsFromMonsterAsync(int monsterId, int ElementId)
        => _elementRepository.RemoveElementsFromMonsterAsync(monsterId, ElementId);
}
