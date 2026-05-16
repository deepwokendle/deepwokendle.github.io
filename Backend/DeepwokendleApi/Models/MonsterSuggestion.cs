namespace DeepwokendleApi.Models
{
    public class MonsterSuggestion
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
        public bool Humanoid { get; set; }
        public bool Pending { get; set; }
        public string UserAtCreation { get; set; } = string.Empty;
        public string Element { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public List<string> Loots { get; set; } = [];
        public List<string> Locations { get; set; } = [];
        public int LikeCount { get; set; }
        public int DislikeCount { get; set; }
        public int? UserVote { get; set; }
        public List<string> LastLikers { get; set; } = [];
        public List<string> LastDislikers { get; set; } = [];
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    internal class MonsterSuggestionRow
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
        public bool Humanoid { get; set; }
        public bool Pending { get; set; }
        public string UserAtCreation { get; set; } = string.Empty;
        public string Element { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Loots { get; set; } = string.Empty;
        public string Locations { get; set; } = string.Empty;
        public int LikeCount { get; set; }
        public int DislikeCount { get; set; }
        public int? UserVote { get; set; }
        public string LastLikers { get; set; } = string.Empty;
        public string LastDislikers { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
