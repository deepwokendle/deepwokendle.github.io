namespace DeepwokendleApi.Commands
{
    public class AttemptCommand
    {
        public int? Id { get; set; }
        public int MonsterId { get; set; }
        public string User { get; set; }
        public DateTime GuessDate { get; set; }
        public bool? Infinite { get; set; }
    }
}
