using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Models;
using DeepwokendleApi.Interfaces;
using DeepwokendleApi.Commands;
using Microsoft.AspNetCore.Authorization;

namespace DeepwokendleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ElementsController : ControllerBase
    {
        private readonly IElementService _elementService;
        public ElementsController(IElementService elementService)
        {
            _elementService = elementService;
        }

        [HttpGet("getElements")]
        public async Task<IActionResult> GetAllElements()
        {
            try
            {
                var elements = await _elementService.GetElements();
                if (elements == null || !elements.Any())
                    return NotFound();
                return Ok(elements);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
