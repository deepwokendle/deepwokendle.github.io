using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Interfaces;

namespace DeepwokendleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LootsController : ControllerBase
    {
        private readonly ILootService _lootService;
        public LootsController(ILootService lootService)
        {
            _lootService = lootService;
        }

        [HttpGet("getLoots")]
        public async Task<IActionResult> GetAllLoots()
        {
            try
            {
                var loots = await _lootService.GetAllLoot();
                if (loots == null || !loots.Any())
                    return NotFound();
                return Ok(loots);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
