namespace Server.Models;

public class Product
{
    public int ProductId { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Type { get; set; } = string.Empty; // "books", "uniforms", "school_supplies"
    public string? Author { get; set; }
    public string? Subject { get; set; }
    public string? Size { get; set; }
    public string? SchoolSupplyType { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 