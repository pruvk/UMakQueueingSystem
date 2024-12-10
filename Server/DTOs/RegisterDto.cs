namespace Server.DTOs;

public record RegisterDto(
    string Username, 
    string Password,
    string FirstName,
    string? MiddleName,
    string? LastName
); 