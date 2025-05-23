namespace DeepwokendleApi.Models;
public class Monster
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Picture { get; set; }
    public string FightingStyle { get; set; }
    public string MainHabitat { get; set; }
    public bool Humanoid { get; set; }
    public int ElementId { get; set; }
    public Element Element { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; }
    public ICollection<Loot> LootDatas { get; set; }
    public ICollection<Location> Locations { get; set; }
    public string Gives { get; set; }
}
