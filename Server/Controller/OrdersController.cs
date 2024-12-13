using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;
using Microsoft.AspNetCore.Authorization;

namespace Server.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AuthDbContext _context;

    public OrdersController(AuthDbContext context)
    {
        _context = context;
    }

    // GET: api/orders/device/{deviceId}
    [HttpGet("device/{deviceId}")]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetDeviceOrders(int deviceId)
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .Where(o => o.DeviceId == deviceId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var orderDtos = orders.Select(o => new OrderResponseDto(
            o.OrderId,
            o.DeviceId,
            o.Items.Select(i => new OrderItemDto(
                i.ProductId,
                i.Quantity,
                i.Price
            )).ToList(),
            o.Total,
            o.Status,
            new CustomerInfoDto(
                o.CustomerInfo.Name,
                o.CustomerInfo.StudentId,
                o.CustomerInfo.ContactNumber,
                o.CustomerInfo.Professor
            ),
            o.PaymentMethod,
            o.CreatedAt
        ));

        return Ok(orderDtos);
    }

    // POST: api/orders
    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder(OrderDto orderDto)
    {
        Console.WriteLine($"Received request with payload: {System.Text.Json.JsonSerializer.Serialize(orderDto)}");
        
        var device = await _context.Devices.FindAsync(orderDto.DeviceId);
        if (device == null)
        {
            Console.WriteLine($"Device with ID {orderDto.DeviceId} not found");
            return NotFound("Device not found");
        }

        var order = new Order
        {
            DeviceId = orderDto.DeviceId,
            Total = orderDto.Total,
            Status = orderDto.Status,
            PaymentMethod = orderDto.PaymentMethod,
            CustomerInfo = new CustomerInfo
            {
                Name = orderDto.CustomerInfo.Name,
                StudentId = orderDto.CustomerInfo.StudentId,
                ContactNumber = orderDto.CustomerInfo.ContactNumber,
                Professor = orderDto.CustomerInfo.Professor
            },
            Items = orderDto.Items.Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                Price = item.Price
            }).ToList(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Load related data for response
        await _context.Entry(order)
            .Collection(o => o.Items)
            .LoadAsync();

        // Create queue entry
        var queue = new Queue
        {
            QueueNumber = $"A{order.OrderId.ToString().PadLeft(3, '0')}",
            OrderId = order.OrderId,
            Status = "waiting"
        };

        _context.Queues.Add(queue);
        await _context.SaveChangesAsync();

        var responseDto = new OrderResponseDto(
            order.OrderId,
            order.DeviceId,
            order.Items.Select(i => new OrderItemDto(
                i.ProductId,
                i.Quantity,
                i.Price
            )).ToList(),
            order.Total,
            order.Status,
            new CustomerInfoDto(
                order.CustomerInfo.Name,
                order.CustomerInfo.StudentId,
                order.CustomerInfo.ContactNumber,
                order.CustomerInfo.Professor
            ),
            order.PaymentMethod,
            order.CreatedAt
        );

        return CreatedAtAction(
            nameof(GetDeviceOrders),
            new { deviceId = order.DeviceId },
            responseDto
        );
    }

    // PUT: api/orders/{orderId}/status
    [HttpPut("{orderId}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] string status)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
            return NotFound();

        // Validate status
        if (!new[] { "pending", "processing", "completed", "cancelled" }.Contains(status.ToLower()))
            return BadRequest("Invalid status");

        order.Status = status.ToLower();
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/orders/{orderId}
    [HttpGet("{orderId}")]
    public async Task<ActionResult<OrderResponseDto>> GetOrder(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
            return NotFound();

        var orderDto = new OrderResponseDto(
            order.OrderId,
            order.DeviceId,
            order.Items.Select(i => new OrderItemDto(
                i.ProductId,
                i.Quantity,
                i.Price
            )).ToList(),
            order.Total,
            order.Status,
            new CustomerInfoDto(
                order.CustomerInfo.Name,
                order.CustomerInfo.StudentId,
                order.CustomerInfo.ContactNumber,
                order.CustomerInfo.Professor
            ),
            order.PaymentMethod,
            order.CreatedAt
        );

        return Ok(orderDto);
    }
}