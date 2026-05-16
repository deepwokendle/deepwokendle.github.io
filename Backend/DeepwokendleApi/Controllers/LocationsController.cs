using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Interfaces;

namespace DeepwokendleApi.Controllers
{
    public record CreateLocationRequest(string Name);

    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _locationService;
        public LocationsController(ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet("getLocations")]
        public async Task<IActionResult> GetAllLocations()
        {
            try
            {
                var locations = await _locationService.GetAllLocations();
                if (locations == null || !locations.Any())
                    return NotFound();
                return Ok(locations);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("admin-create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminCreateLocation([FromBody] CreateLocationRequest req)
        {
            try
            {
                var location = await _locationService.CreateLocationAsync(req.Name);
                return Ok(location);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("admin-delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminDeleteLocation(int id)
        {
            try
            {
                await _locationService.DeleteLocationAsync(id);
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
