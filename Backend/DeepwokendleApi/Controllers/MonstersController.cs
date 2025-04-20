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
            new Monster { Id = 1, Name = "Sharko", Picture = "/img/sharko.png", FightingStyle = "Spikes", MainHabitat = "Viper's Jaw", Humanoid = false },
            new Monster { Id = 2, Name = "Akira", Picture = "/img/akira.png", FightingStyle = "Sword", MainHabitat = "Castle Light", Humanoid = true },
            new Monster { Id = 3, Name = "Owl", Picture = "/img/owl.png", FightingStyle = "Feathers", MainHabitat = "The Depths", Humanoid = false },
            new Monster { Id = 4, Name = "Chaser", Picture = "/img/chaser.jpg", FightingStyle = "Blood", MainHabitat = "Layer 2", Humanoid = true },
            new Monster { Id = 5, Name = "Duke Erisia", Picture = "/img/duke.jpg", FightingStyle = "Galebreathe", MainHabitat = "Upper Erisia", Humanoid = true },
            new Monster { Id = 6, Name = "Lord Regent", Picture = "/img/regent.jpg", FightingStyle = "Shadow", MainHabitat = "Etris", Humanoid = true },
            new Monster { Id = 7, Name = "Ferryman", Picture = "/img/Ferryman.jpg", FightingStyle = "Thunder", MainHabitat = "Boatman's Watch", Humanoid = true },
            new Monster { Id = 8, Name = "Yun'Shul", Picture = "/img/yunshul.jpg", FightingStyle = "???", MainHabitat = "The Depths", Humanoid = false },
            new Monster { Id = 9, Name = "Mudskipper", Picture = "/img/mudskipper.jpg", FightingStyle = "Fists", MainHabitat = "Lower Erisia", Humanoid = false },
            new Monster { Id = 10, Name = "Lower Bandit", Picture = "/img/BanditNormal.webp", FightingStyle = "Variable", MainHabitat = "Lower Erisia", Humanoid = true },
            new Monster { Id = 11, Name = "Thresher", Picture = "/img/Thresher.webp", FightingStyle = "Bite", MainHabitat = "Starswept Valley", Humanoid = false },
            new Monster { Id = 12, Name = "Nautilodaunt", Picture = "/img/nautilodaunt.jpg", FightingStyle = "Fists", MainHabitat = "City of The Drowned", Humanoid = false },
            new Monster { Id = 13, Name = "Gigamed", Picture = "/img/Gigamed.jpg", FightingStyle = "Thunder", MainHabitat = "The Depths", Humanoid = false },
            new Monster { Id = 14, Name = "Bone Keeper", Picture = "/img/BoneKeeper.jpg", FightingStyle = "Bones", MainHabitat = "Layer 2", Humanoid = false },
            new Monster { Id = 15, Name = "Mudskipper Broodlord", Picture = "/img/MudskipperBroodlord.jpg", FightingStyle = "Fists", MainHabitat = "The Depths", Humanoid = false },
            new Monster { Id = 16, Name = "Enforcer", Picture = "/img/Swordforcer.webp", FightingStyle = "Heavy Weapons", MainHabitat = "Depths Trial", Humanoid = false },
            new Monster { Id = 17, Name = "Scion of Ethiron", Picture = "/img/Ethiron.jpg", FightingStyle = "Galebreathe", MainHabitat = "Layer 2 Floor 2", Humanoid = false },
            new Monster { Id = 18, Name = "Lionfish", Picture = "/img/Lionfish.jpg", FightingStyle = "Beam", MainHabitat = "The Depths", Humanoid = false },
            new Monster { Id = 19, Name = "Dread Serpent", Picture = "/img/DreadSerpent.jpg", FightingStyle = "Dragon", MainHabitat = "Voidsea", Humanoid = false },
            new Monster { Id = 20, Name = "Klaris Llfiend", Picture = "/img/klaris.jpg", FightingStyle = "Dawnwalker", MainHabitat = "Castle Light", Humanoid = true },
            new Monster { Id = 21, Name = "The Meat Lord", Picture = "/img/TheMeatLord.jpg", FightingStyle = "???", MainHabitat = "Starswept Valley", Humanoid = true },
            new Monster { Id = 22, Name = "Karliah", Picture = "/img/Karliah.webp", FightingStyle = "???", MainHabitat = "Etris", Humanoid = true },
            new Monster { Id = 23, Name = "Immortal Guardian", Picture = "/img/IMMGUARD.webp", FightingStyle = "Heavy Weapons", MainHabitat = "Crypt of the Unbroken", Humanoid = true },

        };

        return Ok(monsters);
    }
}