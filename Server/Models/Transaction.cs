using System;

namespace Server.Models;

public class Transaction
{
    public int TransactionId { get; set; }
    public string QueueNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; }
    public string CompletedBy { get; set; } = string.Empty;
    public int OrderId { get; set; }
    public Order? Order { get; set; }
}