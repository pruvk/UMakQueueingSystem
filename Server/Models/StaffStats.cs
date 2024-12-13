public class StaffStats
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User Staff { get; set; } = null!;
    public DateTime Date { get; set; }
    public int OrdersProcessed { get; set; }
    public int CustomersServed { get; set; }
    public decimal TotalSales { get; set; }
    public TimeSpan AverageProcessingTime { get; set; }
} 