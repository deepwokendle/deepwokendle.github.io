using DeepwokendleApi.Models;

namespace DeepwokendleApi.Data
{
    public static class LootData
    {
        public static void Seed(DeepwokendleContext context)
        {
            // 1. Categories
            var categories = new List<Category>
            {
                new Category { Id = 1, Name = "Monster Parts" },
                new Category { Id = 2, Name = "Mantra Modifiers" },
                new Category { Id = 3, Name = "Equipment" },
                new Category { Id = 4, Name = "Unbound Stat" },
                new Category { Id = 5, Name = "Food" },
                new Category { Id = 6, Name = "MISC" },
                new Category { Id = 7, Name = "Chest" },
                new Category { Id = 8, Name = "Attunement Stones" },
                new Category { Id = 9, Name = "Weapons" },
                new Category { Id = 10, Name = "Monster Mantras" },
                new Category { Id = 11, Name = "Armour Blueprints" }
            };
            context.Categories.AddRange(categories);

            // 2. Loot items
            var lootItems = new List<LootItem>
            {
                new LootItem { Id = 1, Name = "Megalodaunt Hide", CategoryId = 1 },
                new LootItem { Id = 2, Name = "Thresher Spine", CategoryId = 1 },
                new LootItem { Id = 3, Name = "Void/Dark Feather", CategoryId = 1 },
                new LootItem { Id = 4, Name = "Odd Tentacle", CategoryId = 1 },
                new LootItem { Id = 5, Name = "Lionfish Scale", CategoryId = 1 },

                new LootItem { Id = 6, Name = "Mantra Modifiers", CategoryId = 2 },

                new LootItem { Id = 7, Name = "Megalodaunt Coat", CategoryId = 3 },
                new LootItem { Id = 8, Name = "Equipment", CategoryId = 3 },

                new LootItem { Id = 9, Name = "Unbound Stat", CategoryId = 4 },
                new LootItem { Id = 10, Name = "Food", CategoryId = 5 },
                new LootItem { Id = 11, Name = "MISC", CategoryId = 6 },
                new LootItem { Id = 12, Name = "Chest", CategoryId = 7 },

                new LootItem { Id = 13, Name = "Attunement Stones", CategoryId = 8 },

                new LootItem { Id = 14, Name = "Coral Cestus", CategoryId = 9 },
                new LootItem { Id = 15, Name = "Heavy Weapons", CategoryId = 9 },
                new LootItem { Id = 16, Name = "Weapons", CategoryId = 9 },

                new LootItem { Id = 17, Name = "Thresher Talon", CategoryId = 10 },
                new LootItem { Id = 18, Name = "Nautilodaunt Beak", CategoryId = 10 },
                new LootItem { Id = 19, Name = "Megalodaunt Coral", CategoryId = 10 },
                new LootItem { Id = 20, Name = "Giant Femur", CategoryId = 10 },
                new LootItem { Id = 21, Name = "Dread Serpent's Tooth", CategoryId = 10 },

                new LootItem { Id = 22, Name = "Armour Blueprints", CategoryId = 11 },
                new LootItem { Id = 23, Name = "Jet Black Justicar Defender Coat", CategoryId = 11 }
            };
            context.LootItems.AddRange(lootItems);

            // 3. Relationships (Loot)
            var Loots = new List<Loot>
            {
                // Monster Parts
                new Loot { MonsterId = 1, LootItemId = 1 },
                new Loot { MonsterId = 11, LootItemId = 2 },
                new Loot { MonsterId = 3, LootItemId = 3 },
                new Loot { MonsterId = 12, LootItemId = 4 },
                new Loot { MonsterId = 18, LootItemId = 5 },

                // Mantra Modifiers
                new Loot { MonsterId = 1, LootItemId = 6 },
                new Loot { MonsterId = 11, LootItemId = 6 },
                new Loot { MonsterId = 9, LootItemId = 6 },
                new Loot { MonsterId = 10, LootItemId = 6 },
                new Loot { MonsterId = 15, LootItemId = 6 },
                new Loot { MonsterId = 16, LootItemId = 6 },
                new Loot { MonsterId = 18, LootItemId = 6 },
                new Loot { MonsterId = 23, LootItemId = 6 },

                // Equipment
                new Loot { MonsterId = 1, LootItemId = 7 },
                new Loot { MonsterId = 19, LootItemId = 8 },
                new Loot { MonsterId = 23, LootItemId = 8 },

                // Unbound Stat
                new Loot { MonsterId = 22, LootItemId = 9 },
                new Loot { MonsterId = 2, LootItemId = 9 },
                new Loot { MonsterId = 4, LootItemId = 9 },
                new Loot { MonsterId = 5, LootItemId = 9 },

                // Food
                new Loot { MonsterId = 21, LootItemId = 10 },

                // MISC
                new Loot { MonsterId = 2, LootItemId = 11 },
                new Loot { MonsterId = 4, LootItemId = 11 },
                new Loot { MonsterId = 5, LootItemId = 11 },
                new Loot { MonsterId = 6, LootItemId = 11 },
                new Loot { MonsterId = 8, LootItemId = 11 },
                new Loot { MonsterId = 19, LootItemId = 11 },
                new Loot { MonsterId = 20, LootItemId = 11 },
                new Loot { MonsterId = 21, LootItemId = 11 },
                new Loot { MonsterId = 22, LootItemId = 11 },

                // Chest
                new Loot { MonsterId = 4, LootItemId = 12 },
                new Loot { MonsterId = 5, LootItemId = 12 },
                new Loot { MonsterId = 7, LootItemId = 12 },
                new Loot { MonsterId = 17, LootItemId = 12 },
                new Loot { MonsterId = 19, LootItemId = 12 },

                // Attunement Stones
                new Loot { MonsterId = 9, LootItemId = 13 },
                new Loot { MonsterId = 1, LootItemId = 13 },
                new Loot { MonsterId = 11, LootItemId = 13 },
                new Loot { MonsterId = 13, LootItemId = 13 },

                // Weapons
                new Loot { MonsterId = 15, LootItemId = 14 },
                new Loot { MonsterId = 16, LootItemId = 15 },
                new Loot { MonsterId = 19, LootItemId = 16 },

                // Monster Mantras
                new Loot { MonsterId = 11, LootItemId = 17 },
                new Loot { MonsterId = 12, LootItemId = 18 },
                new Loot { MonsterId = 1, LootItemId = 19 },
                new Loot { MonsterId = 14, LootItemId = 20 },
                new Loot { MonsterId = 19, LootItemId = 21 },

                // Armour Blueprints
                new Loot { MonsterId = 12, LootItemId = 22 },
                new Loot { MonsterId = 15, LootItemId = 22 },
                new Loot { MonsterId = 3, LootItemId = 23 }
            };
            context.LootDatas.AddRange(Loots);

            context.SaveChanges();
        }
    }
}