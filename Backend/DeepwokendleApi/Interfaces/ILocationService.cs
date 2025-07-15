using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface ILocationService
    {
        Task AddLocationToMonsterAsync(int monsterId, int locationId);
        Task<IEnumerable<string>> GetLocationsByMonsterIdAsync(int monsterId);
        Task<IEnumerable<Location>> GetAllLocations();
        Task<IEnumerable<MonsterLocation>> GetAllMonsterLocation();
        Task RemoveLocationsFromMonsterAsync(int monsterId, int locationId);
    }
}
