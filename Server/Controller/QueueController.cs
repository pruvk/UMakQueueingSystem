using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class QueueController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public QueueController(AuthDbContext context)
        {
            _context = context;
        }

        [HttpPost("{queueNumber}/complete")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<ApiResponse<string>>> CompleteQueue(string queueNumber)
        {
            try
            {
                // Find the queue that is currently being served
                var queue = await _context.Queues
                    .Include(q => q.Order)
                    .FirstOrDefaultAsync(q => q.QueueNumber == queueNumber && q.Status == "serving");

                if (queue == null)
                {
                    return NotFound(new ApiResponse<string>
                    {
                        Success = false,
                        Message = $"Queue {queueNumber} not found or not currently being served",
                        Data = default
                    });
                }

                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                // Create transaction record
                var transaction = new Transaction
                {
                    QueueNumber = queueNumber,
                    Status = "completed",
                    CompletedAt = DateTime.UtcNow,
                    CompletedBy = username ?? "unknown",
                    OrderId = queue.OrderId
                };

                _context.Transactions.Add(transaction);

                // Update queue status
                queue.Status = "completed";
                queue.CompletedAt = DateTime.UtcNow;

                // Update order status
                if (queue.Order != null)
                {
                    queue.Order.Status = "completed";
                }

                // Update cashier's current number
                if (queue.CashierId.HasValue)
                {
                    var cashier = await _context.Cashiers.FindAsync(queue.CashierId.Value);
                    if (cashier != null)
                    {
                        cashier.CurrentNumber = "0000";
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "Queue completed successfully",
                    Data = default
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    Message = "Failed to complete queue",
                    Error = ex.Message,
                    Data = default
                });
            }
        }

        [HttpGet("next/{cashierId}")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<ApiResponse<string>>> GetNextQueueForCashier(int cashierId)
        {
            try
            {
                var cashier = await _context.Cashiers.FindAsync(cashierId);
                if (cashier == null)
                    return NotFound(new ApiResponse<string> 
                    { 
                        Success = false,
                        Message = "Cashier not found",
                        Data = default
                    });

                var nextQueue = await _context.Queues
                    .Where(q => q.Status == "waiting")
                    .OrderBy(q => q.CreatedAt)
                    .FirstOrDefaultAsync();

                if (nextQueue == null)
                    return Ok(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "No customers waiting in line",
                        Data = default
                    });

                // Update queue status
                nextQueue.Status = "serving";
                nextQueue.CashierId = cashierId;
                nextQueue.CalledAt = DateTime.UtcNow;

                // Update cashier's current number
                cashier.CurrentNumber = nextQueue.QueueNumber;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "Next customer assigned successfully",
                    Data = default
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    Message = ex.Message,
                    Data = default
                });
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Queue>>> GetAllQueues()
        {
            try
            {
                var queues = await _context.Queues
                    .Include(q => q.Order)
                    .OrderByDescending(q => q.CreatedAt)
                    .ToListAsync();

                return Ok(queues);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{queueNumber}/cancel")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<ApiResponse<string>>> CancelQueue(string queueNumber)
        {
            try
            {
                var queue = await _context.Queues
                    .Include(q => q.Order)
                    .FirstOrDefaultAsync(q => q.QueueNumber == queueNumber && q.Status == "serving");

                if (queue == null)
                {
                    return NotFound(new ApiResponse<string>
                    {
                        Success = false,
                        Message = $"Queue {queueNumber} not found or not currently being served",
                        Data = default
                    });
                }

                var username = User.FindFirst(ClaimTypes.Name)?.Value;

                // Create transaction record for cancelled transaction
                var transaction = new Transaction
                {
                    QueueNumber = queueNumber,
                    Status = "cancelled",
                    CompletedAt = DateTime.UtcNow,
                    CompletedBy = username ?? "unknown",
                    OrderId = queue.OrderId
                };

                _context.Transactions.Add(transaction);

                // Update queue status
                queue.Status = "cancelled";
                queue.CompletedAt = DateTime.UtcNow;

                // Update order status
                if (queue.Order != null)
                {
                    queue.Order.Status = "cancelled";
                }

                // Reset cashier's current number if assigned
                if (queue.CashierId.HasValue)
                {
                    var cashier = await _context.Cashiers.FindAsync(queue.CashierId.Value);
                    if (cashier != null)
                    {
                        cashier.CurrentNumber = "0000";
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "Queue cancelled successfully",
                    Data = default
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    Message = "Failed to cancel queue",
                    Error = ex.Message,
                    Data = default
                });
            }
        }

        [HttpGet("number/{queueNumber}")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<ApiResponse<QueueDto>>> GetQueueByNumber(string queueNumber)
        {
            try
            {
                var queue = await _context.Queues
                    .FirstOrDefaultAsync(q => q.QueueNumber == queueNumber);

                if (queue == null)
                {
                    return NotFound(new ApiResponse<QueueDto>
                    {
                        Success = false,
                        Message = "Queue not found",
                        Data = default
                    });
                }

                var queueDto = new QueueDto
                {
                    QueueId = queue.QueueId,
                    QueueNumber = queue.QueueNumber,
                    Status = queue.Status,
                    OrderId = queue.OrderId,
                    CashierId = queue.CashierId,
                    CreatedAt = queue.CreatedAt,
                    CalledAt = queue.CalledAt,
                    CompletedAt = queue.CompletedAt
                };

                return Ok(new ApiResponse<QueueDto>
                {
                    Success = true,
                    Message = "Queue found",
                    Data = queueDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<QueueDto>
                {
                    Success = false,
                    Message = "Failed to get queue",
                    Error = ex.Message
                });
            }
        }

        // Keep your other existing endpoints...
    }
} 