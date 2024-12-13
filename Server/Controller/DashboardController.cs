using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Server.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin,staff")]
    public class DashboardController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public DashboardController(AuthDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<ApiResponse<object>>> GetDashboardStats()
        {
            try
            {
                // Get current queue length (waiting queues)
                var queueLength = await _context.Queues
                    .CountAsync(q => q.Status == "waiting");

                // Get active cashiers count
                var activeCashiers = await _context.Cashiers
                    .CountAsync(c => c.Status == "active");

                // Get today's transactions
                var today = DateTime.UtcNow.Date;
                var todayTransactions = await _context.Transactions
                    .CountAsync(t => t.CompletedAt.Date == today && t.Status == "completed");

                // Calculate average service time
                var averageServiceTime = await CalculateAverageServiceTime();

                // Get queue status distribution
                var queueStatus = await _context.Queues.GroupBy(q => q.Status)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Status, x => x.Count);

                // Get sales distribution
                var salesDistribution = await _context.OrderItems
                    .Include(oi => oi.Product)
                    .GroupBy(oi => oi.Product.Type)
                    .Select(g => new { Type = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.Type, x => x.Count);

                var stats = new
                {
                    QueueLength = queueLength,
                    ActiveCashiers = activeCashiers,
                    TotalCashiers = 9,
                    TodayTransactions = todayTransactions,
                    AverageServiceTime = averageServiceTime,
                    QueueStatus = new
                    {
                        Waiting = queueStatus.GetValueOrDefault("waiting", 0),
                        Serving = queueStatus.GetValueOrDefault("serving", 0),
                        Completed = queueStatus.GetValueOrDefault("completed", 0),
                        Cancelled = queueStatus.GetValueOrDefault("cancelled", 0)
                    },
                    SalesDistribution = new
                    {
                        Books = salesDistribution.GetValueOrDefault("books", 0),
                        Uniforms = salesDistribution.GetValueOrDefault("uniforms", 0),
                        SchoolSupplies = salesDistribution.GetValueOrDefault("school_supplies", 0)
                    }
                };

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Dashboard stats retrieved successfully",
                    Data = stats
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Failed to retrieve dashboard stats",
                    Error = ex.Message
                });
            }
        }

        private async Task<double> CalculateAverageServiceTime()
        {
            var completedTransactions = await _context.Transactions
                .Where(t => t.Status == "completed")
                .Include(t => t.Queue)
                .Where(t => t.Queue != null && t.Queue.CalledAt != null)
                .ToListAsync();

            if (!completedTransactions.Any())
                return 0;

            var serviceTimes = completedTransactions
                .Select(t => (t.CompletedAt - t.Queue!.CalledAt!.Value).TotalMinutes);

            return serviceTimes.Average();
        }
    }
} 