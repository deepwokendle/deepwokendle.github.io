using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Models;
using DeepwokendleApi.Data;
using DeepwokendleApi.DTOS;

namespace DeepwokendleApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonstersController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<MonsterDto>> Get()
        {
            // 1) lista fixa de monstros, já com ElementId e CategoryId
            var monsters = new List<Monster>
            {
                new Monster { Id =  1, Name = "Sharko",              Picture = "/img/sharko.png",               MainHabitat = "Viper's Jaw",          Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id =  2, Name = "Akira",               Picture = "/img/akira.png",                MainHabitat = "Castle Light",         Humanoid = true,  ElementId = 5, CategoryId = 3 },
                new Monster { Id =  3, Name = "Owl",                 Picture = "/img/owl.png",                  MainHabitat = "The Depths",           Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id =  4, Name = "Chaser",              Picture = "/img/chaser.jpg",               MainHabitat = "Layer 2",              Humanoid = true,  ElementId = 6, CategoryId = 4 },
                new Monster { Id =  5, Name = "Duke Erisia",         Picture = "/img/duke.jpg",                 MainHabitat = "Erisia",               Humanoid = true,  ElementId = 2, CategoryId = 4 },
                new Monster { Id =  6, Name = "Lord Regent",         Picture = "/img/regent.jpg",               MainHabitat = "Etris",                Humanoid = true,  ElementId = 3, CategoryId = 3 },
                new Monster { Id =  7, Name = "Ferryman",            Picture = "/img/Ferryman.jpg",             MainHabitat = "Boatman's Watch",      Humanoid = true,  ElementId = 4, CategoryId = 4 },
                new Monster { Id =  8, Name = "Yun'Shul",            Picture = "/img/yunshul.jpg",              MainHabitat = "The Depths",           Humanoid = false, ElementId = 9, CategoryId = 3 },
                new Monster { Id =  9, Name = "Mudskipper",          Picture = "/img/mudskipper.jpg",           MainHabitat = "Erisia",               Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 10, Name = "Lower Bandit",        Picture = "/img/BanditNormal.webp",        MainHabitat = "Lower Erisia",         Humanoid = true,  ElementId = 8, CategoryId = 3 },
                new Monster { Id = 11, Name = "Thresher",            Picture = "/img/Thresher.webp",            MainHabitat = "Starswept Valley",     Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 12, Name = "Nautilodaunt",        Picture = "/img/nautilodaunt.jpg",         MainHabitat = "The Depths",           Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 13, Name = "Gigamed",             Picture = "/img/Gigamed.jpg",              MainHabitat = "The Depths",           Humanoid = false, ElementId = 4, CategoryId = 2 },
                new Monster { Id = 14, Name = "Bone Keeper",         Picture = "/img/BoneKeeper.jpg",           MainHabitat = "Layer 2",              Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 15, Name = "Mudskipper Broodlord",Picture = "/img/MudskipperBroodlord.jpg",  MainHabitat = "The Depths",           Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 16, Name = "Enforcer",            Picture = "/img/Swordforcer.webp",         MainHabitat = "The Depths",           Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 17, Name = "Scion of Ethiron",    Picture = "/img/Ethiron.jpg",              MainHabitat = "Layer 2",              Humanoid = false, ElementId = 2, CategoryId = 4 },
                new Monster { Id = 18, Name = "Lionfish",            Picture = "/img/Lionfish.jpg",             MainHabitat = "The Depths",           Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 19, Name = "Dread Serpent",       Picture = "/img/DreadSerpent.jpg",         MainHabitat = "Voidsea",              Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 20, Name = "Klaris Llfiend",      Picture = "/img/klaris.jpg",               MainHabitat = "Castle Light",         Humanoid = true,  ElementId = 9, CategoryId = 3 },
                new Monster { Id = 21, Name = "The Meat Lord",       Picture = "/img/TheMeatLord.jpg",          MainHabitat = "Starswept Valley",     Humanoid = true,  ElementId = 9, CategoryId = 3 },
                new Monster { Id = 22, Name = "Karliah",             Picture = "/img/Karliah.webp",             MainHabitat = "Etris",                Humanoid = true,  ElementId = 1, CategoryId = 3 },
                new Monster { Id = 23, Name = "Immortal Guardian",   Picture = "/img/IMMGUARD.webp",            MainHabitat = "Crypt of the Unbroken",Humanoid = true,  ElementId = 1, CategoryId = 3 },
            };
            foreach (var m in monsters)
            {
                m.Element = ElementData.Elements
                                .First(e => e.Id == m.ElementId);
                m.Category = CategoryData.Categories
                                .First(c => c.Id == m.CategoryId);
            }

            var monsterLootMap = new Dictionary<int, List<int>>
            {
                {  1, new List<int>{  1, 19, 20 } },  // Sharko
                {  2, new List<int>{ 21, 22      } },  // Akira
                {  3, new List<int>{  3, 17      } },  // Owl
                {  4, new List<int>{ 21, 22, 23 } },  // Chaser
                {  5, new List<int>{ 21, 22, 23 } },  // Duke Erisia
                {  6, new List<int>{ 22         } },  // Lord Regent
                {  7, new List<int>{ 23         } },  // Ferryman
                {  8, new List<int>{ 22         } },  // Yun'Shul
                {  9, new List<int>{ 19, 20     } },  // Mudskipper
                { 10, new List<int>{ 19         } },  // Lower Bandit
                { 11, new List<int>{  2, 19, 20,  8 } },  // Thresher
                { 12, new List<int>{  4,  9, 16  } },  // Nautilodaunt
                { 13, new List<int>{ 20         } },  // Gigamed
                { 14, new List<int>{ 11         } },  // Bone Keeper
                { 15, new List<int>{ 19, 13, 16 } },  // Mudskipper Broodlord
                { 16, new List<int>{ 19, 14     } },  // Enforcer
                { 17, new List<int>{ 23         } },  // Scion of Ethiron
                { 18, new List<int>{  5, 19     } },  // Lionfish
                { 19, new List<int>{  7, 22, 23, 12 } },  // Dread Serpent
                { 20, new List<int>{ 22         } },  // Klaris Llfiend
                { 21, new List<int>{ 18, 22     } },  // The Meat Lord
                { 22, new List<int>{ 21, 22     } },  // Karliah
                { 23, new List<int>{ 19,  7     } },  // Immortal Guardian
            };

            var dtos = monsters
                .Select(m => new MonsterDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Picture = m.Picture,
                    MainHabitat = m.MainHabitat,
                    Humanoid = m.Humanoid,
                    Element = m.Element.Name,
                    Category = m.Category.Name,
                    Gives = monsterLootMap.TryGetValue(m.Id, out var lootIds)
                        ? lootIds
                            .Select(id => LootData.Loots.First(l => l.Id == id).Name)
                            .OrderBy(name => name)
                            .ToList()
                        : new List<string>()
                })
                .ToList();

            return Ok(dtos);
        }
    }
}
