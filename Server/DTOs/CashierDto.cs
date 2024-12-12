namespace Server.DTOs
{
    public class CashierDto
    {
        public string Name { get; set; } = string.Empty;
        public string CurrentNumber { get; set; } = "0000";
        public string Status { get; set; } = "active";
    }
}
