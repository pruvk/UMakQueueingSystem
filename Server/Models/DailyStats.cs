public class DailyStats
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }
    public int TotalCustomers { get; set; }
    public string? TopSellingProduct { get; set; }
    public int TopSellingQuantity { get; set; }
} 