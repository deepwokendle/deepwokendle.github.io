namespace DeepwokendleApi.Models;
public class Monster
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Picture { get; set; }
    public string MainHabitat { get; set; }
    public bool Humanoid { get; set; }
    public int ElementId { get; set; }
    public Element Element { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; }
    public IEnumerable<MonsterLoot> LootPool { get; set; } 
    public IEnumerable<MonsterLocation> LocationPool { get; set; } 
}
