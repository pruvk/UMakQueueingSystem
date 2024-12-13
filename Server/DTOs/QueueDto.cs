namespace Server.DTOs;

public class QueueDto
{
    public int QueueId { get; set; }
    public string QueueNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public int? CashierId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CalledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
} 