public class InventoryLog
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty; // "in" or "out"
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public int? UserId { get; set; }
    public User? Staff { get; set; }
} 