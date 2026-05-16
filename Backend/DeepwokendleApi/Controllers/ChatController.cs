using DeepwokendleApi.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeepwokendleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatRepository _chatRepository;

        public ChatController(IChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages([FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            if (take > 50) take = 50;
            var messages = await _chatRepository.GetMessagesAsync(skip, take);
            return Ok(messages);
        }

        [HttpPost("report/{externalId}")]
        [Authorize]
        public async Task<IActionResult> Report(string externalId)
        {
            var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
                ?? User.FindFirst("unique_name")?.Value
                ?? User.Identity?.Name;
            if (string.IsNullOrEmpty(username)) return Unauthorized();

            var result = await _chatRepository.ReportMessageAsync(externalId, username);
            return result ? Ok() : Conflict("Message not found or already reported.");
        }
    }
}
