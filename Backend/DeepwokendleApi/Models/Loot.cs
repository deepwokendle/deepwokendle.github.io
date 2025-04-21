namespace DeepwokendleApi.Models
{
    public class Loot
    {
        public int MonsterId { get; set; }
        public Monster Monster { get; set; }

        public int LootItemId { get; set; }
        public LootItem LootItem { get; set; }
    }
}