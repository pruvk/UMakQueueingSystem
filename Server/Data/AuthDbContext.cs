using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Device> Devices { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.Role).HasDefaultValue("user");
            entity.ToTable("users");
        });

        modelBuilder.Entity<Device>(entity =>
        {
            entity.HasKey(e => e.DeviceId);
            entity.Property(e => e.DeviceId).HasColumnName("deviceId");
            entity.Property(e => e.DeviceType).HasConversion(
                v => v.ToLower(),
                v => v.ToLower() == "laptop" ? "laptop" : "pc"
            );
            entity.ToTable("devices");
        });
    }
} 