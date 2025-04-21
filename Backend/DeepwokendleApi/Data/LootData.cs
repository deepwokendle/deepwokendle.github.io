using DeepwokendleApi.Models;

namespace DeepwokendleApi.Data
{
    public static class LootData
    {
        // 1) todas as categorias, extraídas do seu bloco sem repetição
        public static readonly List<LootCategory> Categories = new()
        {
            new LootCategory { Id = 1, Name = "Monster Parts" },
            new LootCategory { Id = 2, Name = "Equipment" },
            new LootCategory { Id = 3, Name = "Monster Mantras" },
            new LootCategory { Id = 4, Name = "Weapons" },
            new LootCategory { Id = 5, Name = "Armour Blueprints" },
            new LootCategory { Id = 6, Name = "Food" },
            new LootCategory { Id = 7, Name = "MISC" },
            new LootCategory { Id = 8, Name = "Chest" },
        };

        // 2) todos os loots, ligados à categoria
        public static readonly List<Loot> Loots = new()
        {
            new Loot { Id =  1, Name = "Megalodaunt Hide",            CategoryId = 1 },
            new Loot { Id =  2, Name = "Thresher Spine",             CategoryId = 1 },
            new Loot { Id =  3, Name = "Void/Dark Feather",          CategoryId = 1 },
            new Loot { Id =  4, Name = "Odd Tentacle",               CategoryId = 1 },
            new Loot { Id =  5, Name = "Lionfish Scale",             CategoryId = 1 },

            new Loot { Id =  6, Name = "Megalodaunt Coat",           CategoryId = 2 },
            new Loot { Id =  7, Name = "Equipment",                  CategoryId = 2 },

            new Loot { Id =  8, Name = "Thresher Talon",             CategoryId = 3 },
            new Loot { Id =  9, Name = "Nautilodaunt Beak",          CategoryId = 3 },
            new Loot { Id = 10, Name = "Megalodaunt Coral",          CategoryId = 3 },
            new Loot { Id = 11, Name = "Giant Femur",                CategoryId = 3 },
            new Loot { Id = 12, Name = "Dread Serpent's Tooth",      CategoryId = 3 },

            new Loot { Id = 13, Name = "Coral Cestus",               CategoryId = 4 },
            new Loot { Id = 14, Name = "Heavy Weapons",              CategoryId = 4 },
            new Loot { Id = 15, Name = "Weapons",                    CategoryId = 4 },

            new Loot { Id = 16, Name = "Armour Blueprints",          CategoryId = 5 },
            new Loot { Id = 17, Name = "Jet Black Justicar Defender Coat", CategoryId = 5 },

            new Loot { Id = 18, Name = "Food",                       CategoryId = 6 },

            new Loot { Id = 19, Name = "Mantra Modifiers",           CategoryId = 7 },
            new Loot { Id = 20, Name = "Attunement Stones",          CategoryId = 7 },
            new Loot { Id = 21, Name = "Unbound Stat",               CategoryId = 7 },
            new Loot { Id = 22, Name = "MISC",                       CategoryId = 7 },

            // Chest
            new Loot { Id = 23, Name = "Chest",                      CategoryId = 8 },
        };
    }
}
