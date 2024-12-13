namespace Server.Models
{
    public class Cashier
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CurrentNumber { get; set; } = "0000";
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual ICollection<Queue> Queues { get; set; } = new List<Queue>();
    }
}