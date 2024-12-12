using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

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
    }
}