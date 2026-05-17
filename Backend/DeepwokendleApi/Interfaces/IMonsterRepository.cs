using DeepwokendleApi.Commands;
using DeepwokendleApi.Models;

namespace DeepwokendleApi.Interfaces
{
    public interface IMonsterRepository
    {
        Task<int> CreateMonsterAsync(MonsterCommand monsterCommand, string username);
        Task InsertMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId);
        Task<IEnumerable<Monster>> GetAllMonstersAsync();
        Task<Monster> GetMonsterByIdAsync(int id);
        Task<int?> GetDailyMonsterIdAsync(DateTime today);
        Task InsertDailyMonsterAsync(DateTime today, int monsterId);
        Task<int> GetRandomMonsterIdAsync();
        Task<int?> GetIncompleteGeneratedMonsterIdByUserAsync(string username);
        Task InsertGeneratedMonsterAsync(string username, int monsterId);
        Task<Monster> GetEnrichedMonsterAsync(int id);
        Task<Dictionary<int, Monster>> GetEnrichedMonstersAsync(int[] ids);
        Task UpdateMonsterAsync(int id, MonsterCommand monsterCommand);
        Task UpdateMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId);
        Task DeleteMonsterAsync(int id);
        Task DeleteMonstersAsync(List<int> ids);
        Task<IEnumerable<Monster>> GetAllMonstersAdminAsync();
        Task<int> AdminCreateMonsterAsync(MonsterCommand monsterCommand, string username);
        Task PublishMonsterAsync(int id);

        Task<(IEnumerable<MonsterSuggestion> Items, int Total)> GetPendingSuggestionsAsync(int page, int pageSize, string sort, string username, string search = "");
        Task<IEnumerable<MonsterSuggestion>> GetUserSuggestionsAsync(string username);
        Task SetMonsterVoteAsync(int monsterId, string username, int vote);
        Task RemoveMonsterVoteAsync(int monsterId, string username);
        Task ReportMonsterAsync(int monsterId, string username);

        Task<int> CreateUserSuggestionAsync(MonsterCommand cmd, string username);
        Task<bool> UpdateUserSuggestionAsync(int id, MonsterCommand cmd, string username);
        Task<bool> DeleteUserSuggestionAsync(int id, string username);
        Task<Monster?> GetUserSuggestionEnrichedAsync(int id, string username);
        Task<MonsterSuggestion?> GetSuggestionByIdAsync(int id, string username);
    }
}
