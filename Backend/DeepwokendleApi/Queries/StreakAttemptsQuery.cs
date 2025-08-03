namespace DeepwokendleApi.Queries
{
    public class StreakAttemptsQuery
    {
        public int StreakAmmount { get; set; }
        public int AttemptsAmount { get; set; }
        public List<int> NpcsGuessedIds { get; set; }
    }
}
