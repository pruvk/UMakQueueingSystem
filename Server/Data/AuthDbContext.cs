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
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Cashier> Cashiers { get; set; }
    public DbSet<Queue> Queues { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;

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

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId);
            entity.Property(e => e.ProductId).HasColumnName("productId");
            entity.Property(e => e.Type).HasConversion(
                v => v.ToLower(),
                v => v.ToLower() == "books" ? "books" : v.ToLower() == "uniforms" ? "uniforms" : "school_supplies"
            );
            entity.ToTable("products");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId);
            entity.Property(e => e.OrderId).HasColumnName("orderId");
            entity.Property(e => e.Status).HasConversion(
                v => v.ToLower(),
                v => v.ToLower()
            );
            entity.ToTable("orders");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId);
            entity.Property(e => e.OrderItemId).HasColumnName("orderItemId");
            entity.HasOne(e => e.Order)
                  .WithMany(o => o.Items)
                  .HasForeignKey(e => e.OrderId);
            entity.HasOne(e => e.Product)
                  .WithMany()
                  .HasForeignKey(e => e.ProductId);
            entity.ToTable("order_items");
        });

        modelBuilder.Entity<Cashier>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("cashierId");
            entity.ToTable("cashiers");
        });

        modelBuilder.Entity<Queue>(entity =>
        {
            entity.HasKey(e => e.QueueId);
            entity.Property(e => e.QueueId).HasColumnName("queueId");
            entity.Property(e => e.Status).HasConversion(
                v => v.ToLower(),
                v => v.ToLower()
            );
            entity.ToTable("queues");
        });

        modelBuilder.Entity<Queue>()
            .HasOne(q => q.Order)
            .WithOne()
            .HasForeignKey<Queue>(q => q.OrderId);

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId);
            entity.Property(e => e.TransactionId).HasColumnName("transactionId");
            entity.HasOne(t => t.Order)
                  .WithOne()
                  .HasForeignKey<Transaction>(t => t.OrderId);
            entity.ToTable("transactions");
        });
    }
} 