using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Models;

namespace DeepwokendleApi.Controllers;
[ApiController]
[Route("api/[controller]")]
public class MonstersController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Monster>> Get()
    {
        var monsters = new List<Monster>
        {
            new Monster { Id = 1, Name = "Sharko", Picture = "/img/sharko.png", FightingStyle = "Irrational", MainHabitat = "Viper's Jaw", Humanoid = false },
            new Monster { Id = 2, Name = "Akira", Picture = "/img/akira.png", FightingStyle = "Sword", MainHabitat = "Upper Erisia", Humanoid = true },
            new Monster { Id = 3, Name = "Owl", Picture = "/img/owl.png", FightingStyle = "Rational", MainHabitat = "The Depths", Humanoid = false }
        };

        return Ok(monsters);
    }
}