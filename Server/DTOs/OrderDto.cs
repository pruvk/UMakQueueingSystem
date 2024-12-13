namespace Server.DTOs;

public record OrderItemDto(
    int ProductId,
    int Quantity,
    decimal Price
);

public record CustomerInfoDto(
    string Name,
    string StudentId,
    string ContactNumber,
    string? Professor
);

public record OrderDto(
    int DeviceId,
    List<OrderItemDto> Items,
    decimal Total,
    string Status,
    CustomerInfoDto CustomerInfo,
    string PaymentMethod
);

public record OrderResponseDto(
    int OrderId,
    int DeviceId,
    List<OrderItemDto> Items,
    decimal Total,
    string Status,
    CustomerInfoDto CustomerInfo,
    string PaymentMethod,
    DateTime CreatedAt
);