using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface ILocationRepository
    {
        Task AddLocationToMonsterAsync(int monsterId, int locationId);
        Task<IEnumerable<string>> GetLocationsByMonsterIdAsync(int monsterId);
        Task<IEnumerable<Location>> GetAllLocationsAsync();
        Task<IEnumerable<MonsterLocation>> GetAllMonsterLocationAsync();
        Task RemoveLocationsFromMonsterAsync(int monsterId, int locationId);
        Task<Location> CreateLocationAsync(string name);
        Task DeleteLocationAsync(int id);
    }
}
