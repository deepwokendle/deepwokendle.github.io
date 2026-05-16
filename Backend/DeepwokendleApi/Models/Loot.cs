namespace DeepwokendleApi.Models
{
    public class Loot
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public LootCategory Category { get; set; }
        public bool CreatedByPlayer { get; set; }
        public string? UserAtCreation { get; set; }
    }
}
