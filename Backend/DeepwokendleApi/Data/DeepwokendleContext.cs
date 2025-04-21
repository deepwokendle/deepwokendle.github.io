using Microsoft.EntityFrameworkCore;
using DeepwokendleApi.Models;

namespace DeepwokendleApi.Data
{
    public class DeepwokendleContext : DbContext
    {
        public DeepwokendleContext(DbContextOptions<DeepwokendleContext> options)
            : base(options) { }

        public DbSet<Monster> Monsters { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Element> Elements { get; set; }
        public DbSet<LootItem> LootItems { get; set; }
        public DbSet<Loot> LootDatas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Loot>()
                .HasKey(ld => new { ld.MonsterId, ld.LootItemId });

            modelBuilder.Entity<Loot>()
                .HasOne(ld => ld.Monster)
                .WithMany(m => m.LootDatas)
                .HasForeignKey(ld => ld.MonsterId);

            modelBuilder.Entity<Loot>()
                .HasOne(ld => ld.LootItem)
                .WithMany(li => li.LootDatas)
                .HasForeignKey(ld => ld.LootItemId);

        }
    }
}
