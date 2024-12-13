namespace Server.Models;

public class Queue
{
    public int QueueId { get; set; }
    public string QueueNumber { get; set; } = null!;
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string Status { get; set; } = "waiting"; // waiting, serving, completed, cancelled
    public int? CashierId { get; set; }  // The cashier currently serving this queue
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CalledAt { get; set; }  // When the customer was called
    public DateTime? CompletedAt { get; set; }
} 