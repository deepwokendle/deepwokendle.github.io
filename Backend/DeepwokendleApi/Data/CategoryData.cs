using DeepwokendleApi.Models;

namespace DeepwokendleApi.Data
{
    public static class CategoryData
    {
        public static readonly List<Category> Categories = new()
        {
            new Category { Id = 1, Name = "None" },
            new Category { Id = 2, Name = "Monster" },
            new Category { Id = 3, Name = "NPC" },
            new Category { Id = 4, Name = "Boss" },
            new Category { Id = 5, Name = "Unknown"},
        };
    }
}
