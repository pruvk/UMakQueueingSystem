using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models;

public class Transaction
{
    [Key]
    public int TransactionId { get; set; }
    public string QueueNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; }
    public string CompletedBy { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public int? QueueId { get; set; }
    
    // Navigation properties
    [ForeignKey("QueueId")]
    public Queue? Queue { get; set; }
    public Order? Order { get; set; }
}