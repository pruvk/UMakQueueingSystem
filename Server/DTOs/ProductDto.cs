namespace Server.DTOs;

public record ProductDto(
    string Name,
    string Description,
    decimal Price,
    string Type,
    string? Author,
    string? Subject,
    string? Size,
    string? SchoolSupplyType,
    string? ImageUrl
);

public record ProductUpdateDto(
    string Name,
    string Description,
    decimal Price,
    string Type,
    string? Author,
    string? Subject,
    string? Size,
    string? SchoolSupplyType,
    string? ImageUrl
); 