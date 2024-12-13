using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;
using Microsoft.AspNetCore.Authorization;

namespace Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public TransactionsController(AuthDbContext context)
        {
            _context = context;
        }

        // GET: api/transactions
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetTransactions()
        {
            try
            {
                var transactions = await _context.Transactions
                    .Include(t => t.Order)
                        .ThenInclude(o => o.CustomerInfo)
                    .OrderByDescending(t => t.CompletedAt)
                    .Select(t => new
                    {
                        t.TransactionId,
                        t.QueueNumber,
                        t.Status,
                        t.CompletedAt,
                        t.CompletedBy,
                        t.OrderId,
                        Order = t.Order == null ? null : new
                        {
                            t.Order.Total,
                            CustomerInfo = new
                            {
                                t.Order.CustomerInfo.Name,
                                t.Order.CustomerInfo.StudentId
                            },
                            t.Order.PaymentMethod
                        }
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<IEnumerable<object>>
                {
                    Success = true,
                    Message = "Transactions retrieved successfully",
                    Data = transactions
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<IEnumerable<object>>
                {
                    Success = false,
                    Message = "Failed to retrieve transactions",
                    Error = ex.Message
                });
            }
        }
    }
}