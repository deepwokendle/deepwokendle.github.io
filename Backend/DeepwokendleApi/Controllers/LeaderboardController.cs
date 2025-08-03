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
    public class LeaderboardController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILeaderboardService _leaderboardService;

        public LeaderboardController(ILeaderboardService leaderboardService)
        {
            _leaderboardService = leaderboardService;
        }

        [Authorize]
        [HttpGet("get-leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            try
            {
                List<LeaderboardQuery> query = await _leaderboardService.GetLeaderboardAsync();
                return Ok(query);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
