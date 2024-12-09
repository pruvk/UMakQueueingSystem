namespace Server.DTOs;

public record UserUpdateDto(
    string Username,
    string FirstName,
    string? MiddleName,
    string? LastName
); 