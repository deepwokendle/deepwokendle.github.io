namespace DeepwokendleApi.DTOS
{
    public class MonsterDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Picture { get; set; }
        public string MainHabitat { get; set; }
        public bool Humanoid { get; set; }
        public string Element { get; set; }
        public string Category { get; set; }
        public IEnumerable<string> Gives { get; set; }
    }
}