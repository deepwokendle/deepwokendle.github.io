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
            var monsters = new List<Monster>
            {
                new Monster { Id =  1, Name = "Sharko",              Picture = "/img/sharko.png",              Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id =  2, Name = "Akira",               Picture = "/img/akira.png",               Humanoid = true,  ElementId = 5, CategoryId = 3 },
                new Monster { Id =  3, Name = "Owl",                 Picture = "/img/owl.png",                 Humanoid = false, ElementId = 3, CategoryId = 2 },
                new Monster { Id =  4, Name = "Chaser",              Picture = "/img/chaser.jpg",              Humanoid = true,  ElementId = 6, CategoryId = 4 },
                new Monster { Id =  5, Name = "Duke Erisia",         Picture = "/img/duke.jpg",                Humanoid = true,  ElementId = 2, CategoryId = 4 },
                new Monster { Id =  6, Name = "Lord Regent",         Picture = "/img/regent.jpg",              Humanoid = true,  ElementId = 3, CategoryId = 3 },
                new Monster { Id =  7, Name = "Ferryman",            Picture = "/img/Ferryman.jpg",            Humanoid = true,  ElementId = 4, CategoryId = 4 },
                new Monster { Id =  8, Name = "Yun'Shul",            Picture = "/img/yunshul.jpg",             Humanoid = false, ElementId = 9, CategoryId = 3 },
                new Monster { Id =  9, Name = "Mudskipper",          Picture = "/img/mudskipper.jpg",          Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 10, Name = "Lower Bandit",        Picture = "/img/BanditNormal.webp",       Humanoid = true,  ElementId = 8, CategoryId = 6 },
                new Monster { Id = 11, Name = "Thresher",            Picture = "/img/Thresher.webp",           Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 12, Name = "Nautilodaunt",        Picture = "/img/nautilodaunt.jpg",        Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 13, Name = "Gigamed",             Picture = "/img/Gigamed.jpg",             Humanoid = false, ElementId = 4, CategoryId = 2 },
                new Monster { Id = 14, Name = "Bone Keeper",         Picture = "/img/BoneKeeper.jpg",          Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 15, Name = "Mudskipper Broodlord",Picture = "/img/MudskipperBroodlord.jpg", Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 16, Name = "Enforcer",            Picture = "/img/Swordforcer.webp",        Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 17, Name = "Scion of Ethiron",    Picture = "/img/Ethiron.jpg",             Humanoid = false, ElementId = 2, CategoryId = 4 },
                new Monster { Id = 18, Name = "Lionfish",            Picture = "/img/Lionfish.jpg",            Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 19, Name = "Dread Serpent",       Picture = "/img/DreadSerpent.jpg",        Humanoid = false, ElementId = 1, CategoryId = 2 },
                new Monster { Id = 20, Name = "Klaris Llfiend",      Picture = "/img/klaris.jpg",              Humanoid = true,  ElementId = 9, CategoryId = 3 },
                new Monster { Id = 21, Name = "The Meat Lord",       Picture = "/img/TheMeatLord.jpg",         Humanoid = true,  ElementId = 9, CategoryId = 3 },
                new Monster { Id = 22, Name = "Karliah",             Picture = "/img/Karliah.webp",            Humanoid = true,  ElementId = 1, CategoryId = 3 },
                new Monster { Id = 23, Name = "Immortal Guardian",   Picture = "/img/IMMGUARD.webp",           Humanoid = true,  ElementId = 1, CategoryId = 6 },
                new Monster { Id = 24, Name = "Primadon",            Picture = "/img/Primadon.webp",           Humanoid = false, ElementId = 1, CategoryId = 4 },
                new Monster { Id = 25, Name = "Kennith",             Picture = "/img/Kennith.webp",            Humanoid = true,  ElementId = 1, CategoryId = 3 },
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
                {  4, new List<int>{ 21, 22, 23, 24 } },  // Chaser
                {  5, new List<int>{ 21, 22, 23, 24 } },  // Duke Erisia
                {  6, new List<int>{ 22, 26     } },  // Lord Regent
                {  7, new List<int>{ 25, 24     } },  // Ferryman
                {  8, new List<int>{ 22         } },  // Yun'Shul
                {  9, new List<int>{ 19, 20     } },  // Mudskipper
                { 10, new List<int>{ 19         } },  // Lower Bandit
                { 11, new List<int>{  2, 19, 20, 8 } },  // Thresher
                { 12, new List<int>{  4,  9, 16 } },  // Nautilodaunt
                { 13, new List<int>{ 20         } },  // Gigamed
                { 14, new List<int>{ 11, 24     } },  // Bone Keeper
                { 15, new List<int>{ 19, 13, 16 } },  // Mudskipper Broodlord
                { 16, new List<int>{ 19, 14     } },  // Enforcer
                { 17, new List<int>{ 23, 24     } },  // Scion of Ethiron
                { 18, new List<int>{  5, 19     } },  // Lionfish
                { 19, new List<int>{  7, 22, 12 } },  // Dread Serpent
                { 20, new List<int>{ 22, 24     } },  // Klaris Llfiend
                { 21, new List<int>{ 18, 22     } },  // The Meat Lord
                { 22, new List<int>{ 21, 22     } },  // Karliah
                { 23, new List<int>{ 19,  7     } },  // Immortal Guardian
                { 24, new List<int>{ 21, 22, 24, 25 } },  // Primadon
                { 25, new List<int>{ 22, 26     } },  // Kennith
            };

            var monsterLocationMap = new Dictionary<int, List<int>>
            {
                {  1, new List<int>{ 1, 3, 11 } },  // Sharko
                {  2, new List<int>{ 1 } },  // Akira
                {  3, new List<int>{ 1, 3, 9 } },  // Owl
                {  4, new List<int>{ 6 } },  // Chaser
                {  5, new List<int>{ 3 } },  // Duke Erisia
                {  6, new List<int>{ 2 } },  // Lord Regent
                {  7, new List<int>{ 10, 7 } },  // Ferryman
                {  8, new List<int>{ 1 } },  // Yun'Shul
                {  9, new List<int>{ 1, 4, 3 } },  // Mudskipper
                { 10, new List<int>{ 3 } },  // Lower Bandit
                { 11, new List<int>{ 1, 8 } },  // Thresher
                { 12, new List<int>{ 1 } },  // Nautilodaunt
                { 13, new List<int>{ 1 } },  // Gigamed
                { 14, new List<int>{ 6 } },  // Bone Keeper
                { 15, new List<int>{ 1, 13 } },  // Mudskipper Broodlord
                { 16, new List<int>{ 1 } },  // Enforcer
                { 17, new List<int>{ 6 } },  // Scion of Ethiron
                { 18, new List<int>{ 1, 13, 7 } },  // Lionfish
                { 19, new List<int>{ 7 } },  // Dread Serpent
                { 20, new List<int>{ 1 } },  // Klaris Llfiend
                { 21, new List<int>{ 8 } },  // The Meat Lord
                { 22, new List<int>{ 2 } },  // Karliah
                { 23, new List<int>{ 5 } },  // Immortal Guardian
                { 24, new List<int>{ 12, 7 } },  // Primadon
                { 25, new List<int>{ 2, 6 } },  // Kennith
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
                        : new List<string>(),
                    Locations = monsterLocationMap.TryGetValue(m.Id, out var locationIds)
                        ? locationIds
                            .Select(id => LocationData.GeneralizedLocations.First(l => l.Id == id).Name)
                            .OrderBy(name => name)
                            .ToList()
                        : new List<string>(),
                })
                .ToList();

            return Ok(dtos);
        }
    }
}
