namespace Server.Models;

public class Device
{
    public int DeviceId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string DeviceOwner { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty; // "laptop" or "pc"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 