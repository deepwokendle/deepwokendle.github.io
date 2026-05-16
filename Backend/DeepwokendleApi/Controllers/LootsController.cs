using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Interfaces;

namespace DeepwokendleApi.Controllers
{
    public record CreateLootRequest(string Name);

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

        [HttpPost("admin-create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminCreateLoot([FromBody] CreateLootRequest req)
        {
            try
            {
                var loot = await _lootService.CreateLootAsync(req.Name);
                return Ok(loot);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("admin-delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminDeleteLoot(int id)
        {
            try
            {
                await _lootService.DeleteLootAsync(id);
                return NoContent();
            }
            catch (Npgsql.PostgresException ex) when (ex.SqlState == "23503")
            {
                return Conflict("linked");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
