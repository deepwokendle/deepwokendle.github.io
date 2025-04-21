using System.Collections.Generic;

namespace DeepwokendleApi.Models
{
    public class LootItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }

        public ICollection<Loot> LootDatas { get; set; }
    }
}
