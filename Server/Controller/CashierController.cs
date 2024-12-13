using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class CashierController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public CashierController(AuthDbContext context)
        {
            _context = context;
        }

        // GET: api/Cashier
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cashier>>> GetCashiers()
        {
            return await _context.Cashiers.ToListAsync();
        }

        // POST: api/Cashier
        [HttpPost]
        public async Task<ActionResult<Cashier>> CreateCashier(Cashier cashier)
        {
            var count = await _context.Cashiers.CountAsync();
            if (count >= 9)
            {
                return BadRequest("Maximum number of cashiers reached");
            }

            _context.Cashiers.Add(cashier);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCashiers), new { id = cashier.Id }, cashier);
        }

        [HttpPost("queue/{queueId}/complete")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<ApiResponse<string>>> CompleteTransaction(int queueId)
        {
            try 
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                
                // Find the queue by ID instead of queue number
                var queue = await _context.Queues
                    .Include(q => q.Order)
                    .FirstOrDefaultAsync(q => q.QueueId == queueId);

                if (queue == null)
                {
                    return NotFound(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Queue not found",
                        Data = default
                    });
                }

                if (queue.OrderId == null)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Queue has no associated order",
                        Data = default
                    });
                }

                // Create transaction record
                var transaction = new Transaction
                {
                    QueueNumber = queue.QueueNumber,
                    Status = "completed",
                    CompletedAt = DateTime.UtcNow,
                    CompletedBy = username ?? "unknown",
                    OrderId = queue.OrderId.Value
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

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "Transaction completed successfully",
                    Data = default
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    Message = "Failed to complete transaction",
                    Error = ex.Message
                });
            }
        }

        [HttpPost("queue/{queueId}/cancel")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<ApiResponse<string>>> CancelTransaction(int queueId)
        {
            try 
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                
                var queue = await _context.Queues
                    .Include(q => q.Order)
                    .FirstOrDefaultAsync(q => q.QueueId == queueId);

                if (queue == null)
                {
                    return NotFound(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Queue not found",
                        Data = default
                    });
                }

                if (queue.OrderId == null)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Queue has no associated order",
                        Data = default
                    });
                }

                // Create transaction record for cancelled transaction
                var transaction = new Transaction
                {
                    QueueNumber = queue.QueueNumber,
                    Status = "cancelled",
                    CompletedAt = DateTime.UtcNow,
                    CompletedBy = username ?? "unknown",
                    OrderId = queue.OrderId.Value
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

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "Transaction cancelled successfully",
                    Data = default
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    Message = "Failed to cancel transaction",
                    Error = ex.Message
                });
            }
        }

         // DELETE: api/Cashier/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCashier(int id)
        {
            try
            {
                var cashier = await _context.Cashiers
                    .Include(c => c.Queues)  // Include related queues
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cashier == null)
                {
                    return NotFound(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Cashier not found",
                        Data = default
                    });
                }

                // Check if cashier has any active queues
                if (cashier.Queues != null && cashier.Queues.Any(q => q.Status == "serving"))
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Message = "Cannot delete cashier with active queues",
                        Data = default
                    });
                }

                // Update any references in Queue table
                var relatedQueues = await _context.Queues
                    .Where(q => q.CashierId == id)
                    .ToListAsync();

                foreach (var queue in relatedQueues)
                {
                    queue.CashierId = null;
                }

                // Now delete the cashier
                _context.Cashiers.Remove(cashier);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "Cashier deleted successfully",
                    Data = default
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    Message = "Failed to delete cashier",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("queue/next/{cashierId}")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<ApiResponse<QueueDto>>> GetNextQueue(int cashierId)
        {
            try
            {
                // First verify the cashier exists
                var cashier = await _context.Cashiers
                    .FirstOrDefaultAsync(c => c.Id == cashierId);

                if (cashier == null)
                {
                    return NotFound(new ApiResponse<QueueDto>
                    {
                        Success = false,
                        Message = "Cashier not found",
                        Data = default
                    });
                }

                // Get the next waiting queue by QueueId order
                var nextQueue = await _context.Queues
                    .Include(q => q.Order)
                    .Where(q => q.Status == "waiting")
                    .OrderBy(q => q.QueueId)
                    .FirstOrDefaultAsync();

                if (nextQueue == null)
                {
                    return Ok(new ApiResponse<QueueDto>
                    {
                        Success = false,
                        Message = "No waiting customers",
                        Data = default
                    });
                }

                // Update queue status
                nextQueue.Status = "serving";
                nextQueue.CashierId = cashierId;
                nextQueue.CalledAt = DateTime.UtcNow;

                // Update cashier's current number
                cashier.CurrentNumber = nextQueue.QueueNumber;

                await _context.SaveChangesAsync();

                var queueDto = new QueueDto
                {
                    QueueId = nextQueue.QueueId,
                    QueueNumber = nextQueue.QueueNumber,
                    Status = nextQueue.Status,
                    OrderId = nextQueue.OrderId,
                    CashierId = nextQueue.CashierId,
                    CreatedAt = nextQueue.CreatedAt,
                    CalledAt = nextQueue.CalledAt,
                    CompletedAt = nextQueue.CompletedAt
                };

                return Ok(new ApiResponse<QueueDto>
                {
                    Success = true,
                    Message = "Next queue assigned successfully",
                    Data = queueDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<QueueDto>
                {
                    Success = false,
                    Message = "Failed to get next queue",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("queue/number/{queueNumber}")]
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

        [HttpGet("queue/serving/{queueNumber}")]
        [Authorize(Roles = "staff")]
        public async Task<ActionResult<ApiResponse<QueueDto>>> GetServingQueue(string queueNumber)
        {
            try
            {
                var queue = await _context.Queues
                    .FirstOrDefaultAsync(q => q.QueueNumber == queueNumber && q.Status == "serving");

                if (queue == null)
                {
                    return NotFound(new ApiResponse<QueueDto>
                    {
                        Success = false,
                        Message = "Queue not found or not currently being served",
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
    }
}