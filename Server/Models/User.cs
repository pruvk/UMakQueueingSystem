namespace Server.Models;

public class User
{
    public int UserId { get; set; }  // Changed from Id to UserId
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "user"; // Default role
    public DateTime CreatedAt { get; set; }
} 