using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Models;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Commands;
using Microsoft.AspNetCore.Authorization;
using DeepwokendleApi.Queries;

namespace DeepwokendleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttemptsController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IAttemptService _attemptService;

        public AttemptsController(IAttemptService attemptService)
        {
            _attemptService = attemptService;
        }

        [Authorize]
        [HttpGet("get-streak")]
        public async Task<IActionResult> GetStreak(string username)
        {
            try
            {
                StreakAttemptsQuery query = await _attemptService.GetStreakAsync(username);
                query.NpcsGuessedIds = await _attemptService.GetAttemptedMonsterIdsAsync(username);
                return Ok(query);
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
                var attemptAmount = await _attemptService.InsertAttempt(attemptCommand);
                attemptAmount++;
                var correct = await _attemptService.UpdateIfCorrect(attemptCommand.User, attemptCommand.MonsterId);
                if(correct && attemptAmount <= 5)
                    await _attemptService.UpdateUserStreak(attemptCommand.User);
                else if(attemptAmount >= 5)
                    await _attemptService.UpdateUserCurrStreak(attemptCommand.User);
                return Ok(attemptAmount);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
