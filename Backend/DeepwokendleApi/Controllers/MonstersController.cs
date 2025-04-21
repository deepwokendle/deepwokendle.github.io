using Microsoft.AspNetCore.Mvc;
using DeepwokendleApi.Models;
using DeepwokendleApi.Data;
using DeepwokendleApi.DTOS;

namespace DeepwokendleApi.Controllers;
[ApiController]
[Route("api/[controller]")]
public class MonstersController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<MonsterDto>> Get()
    {
        var monsters = new List<Monster>
        {
            new Monster { Id = 1, Name = "Sharko", Picture = "/img/sharko.png", FightingStyle = "Spikes", MainHabitat = "Viper's Jaw", Humanoid = false, ElementId = 1, CategoryId = 2},
            new Monster { Id = 2, Name = "Akira", Picture = "/img/akira.png", FightingStyle = "Sword", MainHabitat = "Castle Light", Humanoid = true, ElementId = 5, CategoryId = 3 },
            new Monster { Id = 3, Name = "Owl", Picture = "/img/owl.png", FightingStyle = "Feathers", MainHabitat = "The Depths", Humanoid = false, ElementId = 1, CategoryId = 2},
            new Monster { Id = 4, Name = "Chaser", Picture = "/img/chaser.jpg", FightingStyle = "Blood", MainHabitat = "Layer 2", Humanoid = true, ElementId = 6, CategoryId = 4 },
            new Monster { Id = 5, Name = "Duke Erisia", Picture = "/img/duke.jpg", FightingStyle = "Galebreathe", MainHabitat = "Erisia", Humanoid = true, ElementId = 2, CategoryId = 4 },
            new Monster { Id = 6, Name = "Lord Regent", Picture = "/img/regent.jpg", FightingStyle = "Shadow", MainHabitat = "Etris", Humanoid = true, ElementId = 3, CategoryId = 3 },
            new Monster { Id = 7, Name = "Ferryman", Picture = "/img/Ferryman.jpg", FightingStyle = "Thunder", MainHabitat = "Boatman's Watch", Humanoid = true, ElementId = 4, CategoryId = 4 },
            new Monster { Id = 8, Name = "Yun'Shul", Picture = "/img/yunshul.jpg", FightingStyle = "???", MainHabitat = "The Depths", Humanoid = false, ElementId = 9, CategoryId = 3 },
            new Monster { Id = 9, Name = "Mudskipper", Picture = "/img/mudskipper.jpg", FightingStyle = "Fists", MainHabitat = "Erisia", Humanoid = false, ElementId = 1, CategoryId = 2 },
            new Monster { Id = 10, Name = "Lower Bandit", Picture = "/img/BanditNormal.webp", FightingStyle = "Variable", MainHabitat = "Lower Erisia", Humanoid = true, ElementId = 8, CategoryId = 3 },
            new Monster { Id = 11, Name = "Thresher", Picture = "/img/Thresher.webp", FightingStyle = "Bite", MainHabitat = "Starswept Valley", Humanoid = false, ElementId = 1, CategoryId = 2 },
            new Monster { Id = 12, Name = "Nautilodaunt", Picture = "/img/nautilodaunt.jpg", FightingStyle = "Fists", MainHabitat = "The Depths", Humanoid = false, ElementId = 1, CategoryId = 2 },
            new Monster { Id = 13, Name = "Gigamed", Picture = "/img/Gigamed.jpg", FightingStyle = "Thunder", MainHabitat = "The Depths", Humanoid = false, ElementId = 4 , CategoryId = 2},
            new Monster { Id = 14, Name = "Bone Keeper", Picture = "/img/BoneKeeper.jpg", FightingStyle = "Bones", MainHabitat = "Layer 2", Humanoid = false, ElementId = 1, CategoryId = 2},
            new Monster { Id = 15, Name = "Mudskipper Broodlord", Picture = "/img/MudskipperBroodlord.jpg", FightingStyle = "Fists", MainHabitat = "The Depths", Humanoid = false, ElementId = 1, CategoryId = 2 },
            new Monster { Id = 16, Name = "Enforcer", Picture = "/img/Swordforcer.webp", FightingStyle = "Heavy Weapons", MainHabitat = "The Depths", Humanoid = false, ElementId = 1, CategoryId = 2 },
            new Monster { Id = 17, Name = "Scion of Ethiron", Picture = "/img/Ethiron.jpg", FightingStyle = "Galebreathe", MainHabitat = "Layer 2", Humanoid = false, ElementId = 2, CategoryId = 4 },
            new Monster { Id = 18, Name = "Lionfish", Picture = "/img/Lionfish.jpg", FightingStyle = "Beam", MainHabitat = "The Depths", Humanoid = false, ElementId = 1, CategoryId = 2 },
            new Monster { Id = 19, Name = "Dread Serpent", Picture = "/img/DreadSerpent.jpg", FightingStyle = "Dragon", MainHabitat = "Voidsea", Humanoid = false, ElementId = 1, CategoryId = 2 },
            new Monster { Id = 20, Name = "Klaris Llfiend", Picture = "/img/klaris.jpg", FightingStyle = "Dawnwalker", MainHabitat = "Castle Light", Humanoid = true, ElementId = 9, CategoryId = 3 },
            new Monster { Id = 21, Name = "The Meat Lord", Picture = "/img/TheMeatLord.jpg", FightingStyle = "???", MainHabitat = "Starswept Valley", Humanoid = true, ElementId = 9, CategoryId = 3},
            new Monster { Id = 22, Name = "Karliah", Picture = "/img/Karliah.webp", FightingStyle = "???", MainHabitat = "Etris", Humanoid = true, ElementId = 1, CategoryId = 3},
            new Monster { Id = 23, Name = "Immortal Guardian", Picture = "/img/IMMGUARD.webp", FightingStyle = "Heavy Weapons", MainHabitat = "Crypt of the Unbroken", Humanoid = true, ElementId = 1, CategoryId = 3 },

        };
        foreach (var monster in monsters)
        {
            monster.Category = CategoryData.Categories.FirstOrDefault(c => c.Id == monster.CategoryId);
            monster.Element = ElementData.Elements.FirstOrDefault(e => e.Id == monster.ElementId);
        }

        var lootMapping = new Dictionary<int, List<string>>
        {
            {  1, new List<string>{ "Megalodaunt Hide", "Mantra Modifiers", "Attunement Stones" } },
            {  2, new List<string>{ "Unbound Stat", "MISC" } },
            {  3, new List<string>{ "Void/Dark Feather", "Jet Black Justicar Defender Coat" } },
            {  4, new List<string>{ "Unbound Stat", "MISC", "Chest" } },
            {  5, new List<string>{ "Unbound Stat", "MISC", "Chest" } },
            {  6, new List<string>{ "MISC" } },
            {  7, new List<string>{ "Chest" } },
            {  8, new List<string>{ "MISC" } },
            {  9, new List<string>{ "Mantra Modifiers", "Attunement Stones" } },
            { 10, new List<string>{ "Mantra Modifiers" } },
            { 11, new List<string>{ "Thresher Spine", "Mantra Modifiers", "Attunement Stones", "Thresher Talon" } },
            { 12, new List<string>{ "Odd Tentacle", "Monster Mantras", "Armour Blueprints" } },
            { 13, new List<string>{ "Attunement Stones" } },
            { 14, new List<string>{ "Giant Femur" } },
            { 15, new List<string>{ "Mantra Modifiers", "Coral Cestus", "Armour Blueprints" } },
            { 16, new List<string>{ "Mantra Modifiers", "Heavy Weapons" } },
            { 17, new List<string>{ "Chest" } },
            { 18, new List<string>{ "Lionfish Scale", "Mantra Modifiers" } },
            { 19, new List<string>{ "Equipment", "MISC", "Chest", "Dread Serpent's Tooth" } },
            { 20, new List<string>{ "MISC" } },
            { 21, new List<string>{ "Food", "MISC" } },
            { 22, new List<string>{ "Unbound Stat", "MISC" } },
            { 23, new List<string>{ "Mantra Modifiers", "Equipment" } },
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
                  Gives = lootMapping.TryGetValue(m.Id, out var l)
                   ? l.OrderBy(x => x).ToList()
                   : new List<string>()
              })
              .ToList();

        return Ok(dtos);
    }
}
