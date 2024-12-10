namespace Server.DTOs;

public record DeviceDto(
    string Username,
    string Password,
    string DeviceName,
    string DeviceModel,
    string DeviceOwner,
    string DeviceType
);

public record DeviceUpdateDto(
    string Username,
    string DeviceName,
    string DeviceModel,
    string DeviceOwner,
    string DeviceType
); 