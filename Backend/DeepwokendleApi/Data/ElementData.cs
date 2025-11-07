using DeepwokendleApi.Models;

namespace DeepwokendleApi.Data
{
    public static class ElementData
    {
        public static readonly List<Element> Elements = new()
        {
            new Element { Id = 1, Name = "None" },
            new Element { Id = 2, Name = "Galebreathe" },
            new Element { Id = 3, Name = "Shadowcaster" },
            new Element { Id = 4, Name = "Thundercall" },
            new Element { Id = 5, Name = "Frostdraw" },
            new Element { Id = 6, Name = "Bloodrend" },
            new Element { Id = 7, Name = "Ironsing" },
            new Element { Id = 8, Name = "Attunementless" },
            new Element { Id = 9, Name = "Unknown"}
        };
    }
}
