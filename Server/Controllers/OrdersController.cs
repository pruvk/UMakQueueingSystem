using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
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
            o.CreatedAt
        ));

        return Ok(orderDtos);
    }

    // POST: api/orders
    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder(OrderDto orderDto)
    {
        // Verify device exists
        var device = await _context.Devices.FindAsync(orderDto.DeviceId);
        if (device == null)
            return NotFound("Device not found");

        // Create order
        var order = new Order
        {
            DeviceId = orderDto.DeviceId,
            Total = orderDto.Total,
            Status = "pending",
            Items = orderDto.Items.Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                Price = item.Price
            }).ToList()
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Load related data for response
        await _context.Entry(order)
            .Collection(o => o.Items)
            .LoadAsync();

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
            order.CreatedAt
        );

        return Ok(orderDto);
    }
}