using DeepwokendleApi.Models;
using DeepwokendleApi.Queries;

namespace DeepwokendleApi.Helpers
{
    public static class MonsterComparer
    {
        public static List<GuessFieldResult> Compare(Monster guessed, Monster target)
        {
            var guessedGives = guessed.LootPool?.Select(l => l.LootName).ToList() ?? new List<string>();
            var targetGives = target.LootPool?.Select(l => l.LootName).ToList() ?? new List<string>();
            var guessedLocations = guessed.LocationPool?.Select(l => l.Name).ToList() ?? new List<string>();
            var targetLocations = target.LocationPool?.Select(l => l.Name).ToList() ?? new List<string>();

            return new List<GuessFieldResult>
            {
                new() { Field = "name",      Display = guessed.Name,                              Result = guessed.Name == target.Name ? "correct" : "wrong" },
                new() { Field = "gives",     Display = string.Join(", ", guessedGives),           Result = CompareSets(targetGives, guessedGives) },
                new() { Field = "element",   Display = guessed.Element?.Name ?? "",               Result = guessed.Element?.Name == target.Element?.Name ? "correct" : "wrong" },
                new() { Field = "category",  Display = guessed.Category?.Name ?? "",              Result = guessed.Category?.Name == target.Category?.Name ? "correct" : "wrong" },
                new() { Field = "locations", Display = string.Join(", ", guessedLocations),       Result = CompareLocations(targetLocations, guessedLocations) },
                new() { Field = "humanoid",  Display = guessed.Humanoid ? "✓" : "X",        Result = guessed.Humanoid == target.Humanoid ? "correct" : "wrong" },
            };
        }

        private static string CompareSets(List<string> correct, List<string> guessed)
        {
            var correctSet = new HashSet<string>(correct);
            var guessSet = new HashSet<string>(guessed);
            var intersection = guessSet.Count(x => correctSet.Contains(x));
            if (intersection == correctSet.Count && guessSet.Count == correctSet.Count) return "correct";
            if (intersection > 0) return "partial";
            return "wrong";
        }

        private static string CompareLocations(List<string> correct, List<string> guessed)
        {
            var correctSet = new HashSet<string>(correct);
            var guessSet = new HashSet<string>(guessed);
            if (guessSet.Count == correctSet.Count && guessSet.All(l => correctSet.Contains(l))) return "correct";
            if (guessSet.Any(l => correctSet.Contains(l))) return "partial";
            return "wrong";
        }
    }
}
