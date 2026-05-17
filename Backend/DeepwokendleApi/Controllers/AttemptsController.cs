using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Models;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Commands;
using DeepwokendleApi.Queries;
using DeepwokendleApi.Helpers;
using DeepwokendleApi.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DeepwokendleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttemptsController : ControllerBase
    {
        private readonly IAttemptService _attemptService;
        private readonly IMonsterService _monsterService;
        private readonly IHubContext<ChatHub> _hubContext;

        public AttemptsController(IAttemptService attemptService, IMonsterService monsterService, IHubContext<ChatHub> hubContext)
        {
            _attemptService = attemptService;
            _monsterService = monsterService;
            _hubContext = hubContext;
        }

        [Authorize]
        [HttpGet("get-streak")]
        public async Task<IActionResult> GetStreak()
        {
            try
            {
                var username = User.Identity?.Name;

                var streakTask = _attemptService.GetStreakAsync(username);
                var guessedIdsTask = _attemptService.GetAttemptedMonsterIdsAsync(username);
                var targetIdTask = _monsterService.GetInfiniteMonsterIdForUserAsync(username);
                await Task.WhenAll(streakTask, guessedIdsTask, targetIdTask);

                var query = streakTask.Result;
                var guessedIds = guessedIdsTask.Result;
                var targetId = targetIdTask.Result;

                var previousGuesses = new List<object>();
                if (targetId.HasValue && guessedIds.Count > 0)
                {
                    var allIds = guessedIds.Contains(targetId.Value)
                        ? guessedIds.ToArray()
                        : [.. guessedIds, targetId.Value];
                    var monsters = await _monsterService.GetEnrichedMonstersAsync(allIds);

                    if (monsters.TryGetValue(targetId.Value, out var target))
                    {
                        foreach (var id in guessedIds)
                        {
                            if (monsters.TryGetValue(id, out var guessed))
                            {
                                var fields = MonsterComparer.Compare(guessed, target);
                                previousGuesses.Add(new { monsterId = id, fields });
                            }
                        }
                    }
                }

                return Ok(new
                {
                    streakAmmount = query.StreakAmmount,
                    attemptsAmount = query.AttemptsAmount,
                    previousGuesses,
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPost("insert-attempt")]
        public async Task<IActionResult> InsertAttempt([FromBody] AttemptCommand attemptCommand)
        {
            try
            {
                attemptCommand.User = User.Identity?.Name;

                // Capture target before UpdateIfCorrect marks it completed
                var targetId = await _monsterService.GetInfiniteMonsterIdForUserAsync(attemptCommand.User);
                var correct = targetId.HasValue && attemptCommand.MonsterId == targetId.Value;

                var attemptAmount = await _attemptService.InsertAttempt(attemptCommand);
                attemptAmount++;
                await _attemptService.UpdateIfCorrect(attemptCommand.User, attemptCommand.MonsterId);
                if (correct && attemptAmount <= 5)
                {
                    await _attemptService.UpdateUserStreak(attemptCommand.User);
                    var updatedStreak = await _attemptService.GetStreakAsync(attemptCommand.User);
                    var newStreak = updatedStreak.StreakAmmount;
                    _ = Task.Run(async () =>
                    {
                        var charName = (await _monsterService.GetEnrichedMonsterAsync(targetId!.Value))?.Name ?? "unknown";
                        var attemptsStr = attemptAmount == 1 ? "1 attempt" : $"{attemptAmount} attempts";
                        await _hubContext.Clients.All.SendAsync("ReceiveSystemMessage",
                            $"{attemptCommand.User} has guessed {charName} in infinite mode with {attemptsStr}! They now have a streak of {newStreak}.");
                    });
                }
                int lostStreak = 0;
                if (!correct && attemptAmount >= 5)
                {
                    lostStreak = (await _attemptService.GetStreakAsync(attemptCommand.User)).StreakAmmount;
                    await _attemptService.UpdateUserCurrStreak(attemptCommand.User);
                }

                List<GuessFieldResult> fields = new();
                string targetName = null;
                if (targetId.HasValue)
                {
                    var targetTask = _monsterService.GetEnrichedMonsterAsync(targetId.Value);
                    var guessedTask = _monsterService.GetEnrichedMonsterAsync(attemptCommand.MonsterId);
                    await Task.WhenAll(targetTask, guessedTask);
                    var target = await targetTask;
                    var guessed = await guessedTask;
                    if (target != null && guessed != null)
                        fields = MonsterComparer.Compare(guessed, target);
                    if (correct || attemptAmount >= 5)
                        targetName = target?.Name;

                    if (!correct && attemptAmount >= 5 && targetName != null)
                        _ = Task.Run(() => _hubContext.Clients.All.SendAsync("ReceiveSystemLossMessage",
                            $"{attemptCommand.User} failed to guess {targetName} and lost their streak of {lostStreak}."));
                }

                return Ok(new { correct, attemptAmount, fields, targetName });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("guessed-monsters")]
        public async Task<IActionResult> GetGuessedMonsters()
        {
            try
            {
                var username = User.Identity?.Name;
                var ids = await _attemptService.GetCorrectlyGuessedMonsterIdsAsync(username);
                return Ok(ids);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("monster-stats/{monsterId}")]
        public async Task<IActionResult> GetMonsterStats(int monsterId)
        {
            try
            {
                var username = User.Identity?.Name;
                var stats = await _attemptService.GetMonsterStatsAsync(username, monsterId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("guess-daily")]
        public async Task<IActionResult> GuessDailyMonster([FromBody] DailyGuessCommand command)
        {
            try
            {
                var targetId = await _monsterService.GetCurrentDailyMonsterIdAsync();
                if (!targetId.HasValue)
                    return BadRequest("No daily monster found");

                var targetTask = _monsterService.GetEnrichedMonsterAsync(targetId.Value);
                var guessedTask = _monsterService.GetEnrichedMonsterAsync(command.MonsterId);
                await Task.WhenAll(targetTask, guessedTask);
                var target = await targetTask;
                var guessed = await guessedTask;

                if (target == null || guessed == null)
                    return BadRequest("Monster not found");

                var correct = command.MonsterId == targetId.Value;
                var fields = MonsterComparer.Compare(guessed, target);

                if (correct)
                {
                    var displayName = User.Identity?.Name ?? "A player";
                    var attemptsStr = command.AmountsGuessed == 1 ? "1 attempt" : $"{command.AmountsGuessed} attempts";
                    _ = Task.Run(() => _hubContext.Clients.All.SendAsync("ReceiveSystemMessage",
                        $"{displayName} has guessed a character in normal mode with {attemptsStr}!"));
                }

                return Ok(new { correct, fields });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
