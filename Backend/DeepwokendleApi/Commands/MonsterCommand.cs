namespace DeepwokendleApi.Commands
{
    public class MonsterCommand
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IFormFile File { get; set; }
        public string Picture { get; set; }
        public bool Humanoid { get; set; }
        public int ElementId { get; set; }
        public int CategoryId { get; set; }
        public List<int> LocationsId { get; set; }
        public List<int> LootsId { get; set; }
    }
}
