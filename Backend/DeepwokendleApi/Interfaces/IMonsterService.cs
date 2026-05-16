using DeepwokendleApi.Commands;
using DeepwokendleApi.Models;
using Microsoft.Extensions.Primitives;

namespace DeepwokendleApi.Interfaces
{
    public interface IMonsterService
    {
        Task<int> CreateMonsterAsync(MonsterCommand dto, string username);
        Task InsertMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId);
        Task<IEnumerable<Monster>> GetAllMonstersAsync();
        Task<Monster> GetMonsterByIdAsync(int id);
        Task<object> GetDailyMonsterAsync();
        Task<int?> GetInfiniteMonsterAsync(string username);
        Task<Monster> GetEnrichedMonsterAsync(int id);
        Task<int?> GetCurrentDailyMonsterIdAsync();
        Task<int?> GetInfiniteMonsterIdForUserAsync(string username);
        Task UpdateMonsterAsync(int id, MonsterCommand dto);
        Task UpdateMonsterRelationsAsync(int monsterId, List<int> locationsId, List<int> lootsId);
        Task DeleteMonsterAsync(int id);
        Task DeleteMonstersAsync(List<int> ids);
        Task<IEnumerable<Monster>> GetAllMonstersAdminAsync();
        Task<int> AdminCreateMonsterAsync(MonsterCommand dto, string username);
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
    }
}
