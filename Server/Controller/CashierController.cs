using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Server.Controllers
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

                // Create transaction record
                var transaction = new Transaction
                {
                    QueueNumber = queue.QueueNumber,
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

         // DELETE: api/Cashier/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCashier(int id)
        {
            var cashier = await _context.Cashiers.FindAsync(id);
            if (cashier == null)
            {
                return NotFound();
            }

            _context.Cashiers.Remove(cashier);
            await _context.SaveChangesAsync();

            return NoContent();
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
    }
}