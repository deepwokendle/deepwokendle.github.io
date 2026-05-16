using DeepwokendleApi.Commands;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Models;

public class MonsterService : IMonsterService
{
    private readonly IMonsterRepository _monsterRepository;

    public MonsterService(IMonsterRepository monsterRepository)
    {
        _monsterRepository = monsterRepository;
    }

    public Task<int> CreateMonsterAsync(MonsterCommand monsterCommand, string username)
        => _monsterRepository.CreateMonsterAsync(monsterCommand, username);

    public Task InsertMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId)
        => _monsterRepository.InsertMonsterRelationsAsync(monsterId, locationsId, lootsId);

    public Task<IEnumerable<Monster>> GetAllMonstersAsync()
        => _monsterRepository.GetAllMonstersAsync();

    public Task<Monster> GetMonsterByIdAsync(int id)
        => _monsterRepository.GetMonsterByIdAsync(id);

    public async Task<object> GetDailyMonsterAsync()
    {
        var today = DateTime.UtcNow.Date;
        var monsterId = await _monsterRepository.GetDailyMonsterIdAsync(today);

        if (monsterId == null)
        {
            monsterId = await _monsterRepository.GetRandomMonsterIdAsync();
            await _monsterRepository.InsertDailyMonsterAsync(today, monsterId.Value);
        }

        return new { nextResetUtc = today.AddDays(1).ToString("o") };
    }

    public async Task<int?> GetInfiniteMonsterAsync(string username)
    {
        var monsterId = await _monsterRepository.GetIncompleteGeneratedMonsterIdByUserAsync(username);

        if (monsterId == null)
        {
            monsterId = await _monsterRepository.GetRandomMonsterIdAsync();
            await _monsterRepository.InsertGeneratedMonsterAsync(username, monsterId.Value);
        }

        return monsterId;
    }

    public Task<Monster> GetEnrichedMonsterAsync(int id)
        => _monsterRepository.GetEnrichedMonsterAsync(id);

    public async Task<int?> GetCurrentDailyMonsterIdAsync()
    {
        var today = DateTime.UtcNow.Date;
        var monsterId = await _monsterRepository.GetDailyMonsterIdAsync(today);
        if (monsterId == null)
        {
            monsterId = await _monsterRepository.GetRandomMonsterIdAsync();
            await _monsterRepository.InsertDailyMonsterAsync(today, monsterId.Value);
        }
        return monsterId;
    }

    public Task<int?> GetInfiniteMonsterIdForUserAsync(string username)
        => _monsterRepository.GetIncompleteGeneratedMonsterIdByUserAsync(username);

    public Task UpdateMonsterAsync(int id, MonsterCommand monsterCommand)
        => _monsterRepository.UpdateMonsterAsync(id, monsterCommand);

    public Task UpdateMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId)
        => _monsterRepository.UpdateMonsterRelationsAsync(monsterId, locationsId, lootsId);

    public Task DeleteMonsterAsync(int id)
        => _monsterRepository.DeleteMonsterAsync(id);

    public Task DeleteMonstersAsync(List<int> ids)
        => _monsterRepository.DeleteMonstersAsync(ids);

    public Task<IEnumerable<Monster>> GetAllMonstersAdminAsync()
        => _monsterRepository.GetAllMonstersAdminAsync();

    public Task<int> AdminCreateMonsterAsync(MonsterCommand dto, string username)
        => _monsterRepository.AdminCreateMonsterAsync(dto, username);

    public Task PublishMonsterAsync(int id)
        => _monsterRepository.PublishMonsterAsync(id);

    public Task<(IEnumerable<MonsterSuggestion> Items, int Total)> GetPendingSuggestionsAsync(int page, int pageSize, string sort, string username, string search = "")
        => _monsterRepository.GetPendingSuggestionsAsync(page, pageSize, sort, username, search);

    public Task<IEnumerable<MonsterSuggestion>> GetUserSuggestionsAsync(string username)
        => _monsterRepository.GetUserSuggestionsAsync(username);

    public Task SetMonsterVoteAsync(int monsterId, string username, int vote)
        => _monsterRepository.SetMonsterVoteAsync(monsterId, username, vote);

    public Task RemoveMonsterVoteAsync(int monsterId, string username)
        => _monsterRepository.RemoveMonsterVoteAsync(monsterId, username);

    public Task ReportMonsterAsync(int monsterId, string username)
        => _monsterRepository.ReportMonsterAsync(monsterId, username);

    public Task<int> CreateUserSuggestionAsync(MonsterCommand cmd, string username)
        => _monsterRepository.CreateUserSuggestionAsync(cmd, username);

    public Task<bool> UpdateUserSuggestionAsync(int id, MonsterCommand cmd, string username)
        => _monsterRepository.UpdateUserSuggestionAsync(id, cmd, username);

    public Task<bool> DeleteUserSuggestionAsync(int id, string username)
        => _monsterRepository.DeleteUserSuggestionAsync(id, username);

    public Task<Monster?> GetUserSuggestionEnrichedAsync(int id, string username)
        => _monsterRepository.GetUserSuggestionEnrichedAsync(id, username);
}
