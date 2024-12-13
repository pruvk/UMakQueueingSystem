using System.ComponentModel.DataAnnotations;

namespace Server.Models;

public class Queue
{
    [Key]
    public int QueueId { get; set; }
    public string QueueNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public int? CashierId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CalledAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public Order? Order { get; set; }
    public Cashier? Cashier { get; set; }
    public Transaction? Transaction { get; set; }
} 