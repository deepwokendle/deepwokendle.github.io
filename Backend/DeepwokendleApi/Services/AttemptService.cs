using DeepwokendleApi.Commands;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Queries;

public class AttemptService : IAttemptService
{
    private readonly IAttemptRepository _attemptRepository;

    public AttemptService(IAttemptRepository attemptRepository)
    {
        _attemptRepository = attemptRepository;
    }

    public Task<StreakAttemptsQuery> GetStreakAsync(string username)
        => _attemptRepository.GetStreakAsync(username);

    public Task<List<int>> GetAttemptedMonsterIdsAsync(string username)
        => _attemptRepository.GetAttemptedMonsterIdsAsync(username);

    public async Task<int> InsertAttempt(AttemptCommand attemptCommand)
    {
        attemptCommand.GuessDate = DateTime.UtcNow.Date;
        return await _attemptRepository.InsertAttemptAsync(attemptCommand);
    }

    public async Task<bool> UpdateIfCorrect(string user, int monsterId)
    {
        var result = await _attemptRepository.UpdateIfCorrectAsync(user, monsterId);
        return result ?? false;
    }

    public Task UpdateUserStreak(string user)
        => _attemptRepository.UpdateUserStreakAsync(user);

    public Task UpdateUserCurrStreak(string user)
        => _attemptRepository.UpdateUserCurrStreakAsync(user);

    public Task<List<int>> GetCorrectlyGuessedMonsterIdsAsync(string username)
        => _attemptRepository.GetCorrectlyGuessedMonsterIdsAsync(username);

    public Task<MonsterStatsQuery> GetMonsterStatsAsync(string username, int monsterId)
        => _attemptRepository.GetMonsterStatsAsync(username, monsterId);
}
