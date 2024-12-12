namespace Server.Models;

public class Order
{
    public int OrderId { get; set; }
    public int DeviceId { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "pending"; // pending, processing, completed, cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}