public class ProductStats
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public DateTime Date { get; set; }
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
    public int TimesReturned { get; set; }
} 