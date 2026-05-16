using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;

public class LocationService : ILocationService
{
    private readonly ILocationRepository _locationRepository;

    public LocationService(ILocationRepository locationRepository)
    {
        _locationRepository = locationRepository;
    }

    public Task AddLocationToMonsterAsync(int monsterId, int locationId)
        => _locationRepository.AddLocationToMonsterAsync(monsterId, locationId);

    public Task<IEnumerable<string>> GetLocationsByMonsterIdAsync(int monsterId)
        => _locationRepository.GetLocationsByMonsterIdAsync(monsterId);

    public Task<IEnumerable<Location>> GetAllLocations()
        => _locationRepository.GetAllLocationsAsync();

    public Task<IEnumerable<MonsterLocation>> GetAllMonsterLocation()
        => _locationRepository.GetAllMonsterLocationAsync();

    public Task RemoveLocationsFromMonsterAsync(int monsterId, int locationId)
        => _locationRepository.RemoveLocationsFromMonsterAsync(monsterId, locationId);

    public Task<Location> CreateLocationAsync(string name) => _locationRepository.CreateLocationAsync(name);

    public Task DeleteLocationAsync(int id) => _locationRepository.DeleteLocationAsync(id);

    public Task<IEnumerable<Location>> GetPlayerLocationOptionsAsync(string username)
        => _locationRepository.GetPlayerLocationOptionsAsync(username);

    public Task<Location> CreatePlayerLocationAsync(string name, string username)
        => _locationRepository.CreatePlayerLocationAsync(name, username);
}
