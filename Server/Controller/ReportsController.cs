using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Server.Data;
using Server.DTOs;
using Server.Models;
using Microsoft.AspNetCore.Authorization;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;

namespace Server.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class ReportsController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public ReportsController(AuthDbContext context)
        {
            _context = context;
            QuestPDF.Settings.License = LicenseType.Community;
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GenerateStaffReport()
        {
            try
            {
                var staffMembers = await _context.Users
                    .Where(u => u.Role == "staff")
                    .OrderBy(u => u.UserId)
                    .ToListAsync();

                // Create new PDF document
                var document = new PdfDocument();
                var page = document.AddPage();
                page.Size = PdfSharpCore.PageSize.A4;
                var gfx = XGraphics.FromPdfPage(page);

                // Define fonts
                var regularFont = new XFont("Arial", 10);
                var boldFont = new XFont("Arial", 10, XFontStyle.Bold);
                var titleFont = new XFont("Arial", 16, XFontStyle.Bold);
                var subtitleFont = new XFont("Arial", 12);

                // Define colors
                var headerBgColor = XColor.FromArgb(240, 240, 240);
                var borderColor = XColor.FromArgb(200, 200, 200);
                var textColor = XBrushes.Black;

                // Draw header
                gfx.DrawString("UMak Cooperative", titleFont, textColor, 50, 50);
                gfx.DrawString("Staff Report", subtitleFont, textColor, 50, 70);
                gfx.DrawString($"Generated on: {DateTime.Now:MMMM dd, yyyy}", regularFont, textColor, 50, 90);

                // Draw table header
                var startY = 120;
                var rowHeight = 25;
                var col1X = 50;  // ID
                var col2X = 100; // Name
                var col3X = 250; // Username
                var col4X = 400; // Created At
                var tableWidth = 500;

                // Draw header background
                var headerRect = new XRect(col1X, startY, tableWidth, rowHeight);
                gfx.DrawRectangle(new XSolidBrush(headerBgColor), headerRect);
                gfx.DrawRectangle(new XPen(borderColor), headerRect);

                // Draw header text
                gfx.DrawString("ID", boldFont, textColor, col1X + 5, startY + 16);
                gfx.DrawString("Name", boldFont, textColor, col2X + 5, startY + 16);
                gfx.DrawString("Username", boldFont, textColor, col3X + 5, startY + 16);
                gfx.DrawString("Created At", boldFont, textColor, col4X + 5, startY + 16);

                // Draw data rows
                var currentY = startY + rowHeight;
                foreach (var staff in staffMembers)
                {
                    // Draw row background and border
                    var rowRect = new XRect(col1X, currentY, tableWidth, rowHeight);
                    gfx.DrawRectangle(new XPen(borderColor), rowRect);

                    // Draw cell data
                    gfx.DrawString(staff.UserId.ToString(), regularFont, textColor, col1X + 5, currentY + 16);
                    gfx.DrawString($"{staff.FirstName} {staff.LastName}", regularFont, textColor, col2X + 5, currentY + 16);
                    gfx.DrawString(staff.Username, regularFont, textColor, col3X + 5, currentY + 16);
                    gfx.DrawString(staff.CreatedAt.ToLocalTime().ToString("MM/dd/yyyy"), regularFont, textColor, col4X + 5, currentY + 16);

                    currentY += rowHeight;

                    // Add new page if needed
                    if (currentY > page.Height - 100)
                    {
                        page = document.AddPage();
                        page.Size = PdfSharpCore.PageSize.A4;
                        gfx = XGraphics.FromPdfPage(page);
                        currentY = 50;
                    }
                }

                // Draw summary
                currentY += 20;
                gfx.DrawString($"Total Staff Members: {staffMembers.Count}", boldFont, textColor, col1X, currentY);

                // Save to memory stream
                using var stream = new MemoryStream();
                document.Save(stream, false);
                return File(stream.ToArray(), "application/pdf", "staff_report.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("devices")]
        public async Task<IActionResult> GenerateDeviceReport()
        {
            try
            {
                var devices = await _context.Devices
                    .OrderBy(d => d.DeviceId)
                    .ToListAsync();

                // Create new PDF document
                var document = new PdfDocument();
                var page = document.AddPage();
                page.Size = PdfSharpCore.PageSize.A4;
                var gfx = XGraphics.FromPdfPage(page);

                // Define fonts
                var regularFont = new XFont("Arial", 10);
                var boldFont = new XFont("Arial", 10, XFontStyle.Bold);
                var titleFont = new XFont("Arial", 16, XFontStyle.Bold);
                var subtitleFont = new XFont("Arial", 12);

                // Define colors
                var headerBgColor = XColor.FromArgb(240, 240, 240);
                var borderColor = XColor.FromArgb(200, 200, 200);
                var textColor = XBrushes.Black;

                // Draw header
                gfx.DrawString("UMak Cooperative", titleFont, textColor, 40, 50);
                gfx.DrawString("Device Report", subtitleFont, textColor, 40, 70);
                gfx.DrawString($"Generated on: {DateTime.Now:MMMM dd, yyyy}", regularFont, textColor, 40, 90);

                // Draw table header
                var startY = 120;
                var rowHeight = 25;
                var margin = 40;
                var col1Width = 30;    // ID
                var col2Width = 130;   // Device Name
                var col3Width = 130;   // Model
                var col4Width = 180;   // Owner (increased width)
                var col5Width = 70;    // Type (slightly reduced)

                var col1X = margin;
                var col2X = col1X + col1Width;
                var col3X = col2X + col2Width;
                var col4X = col3X + col3Width;
                var col5X = col4X + col4Width;
                var tableWidth = col1Width + col2Width + col3Width + col4Width + col5Width;

                // Draw header background
                var headerRect = new XRect(margin, startY, tableWidth, rowHeight);
                gfx.DrawRectangle(new XSolidBrush(headerBgColor), headerRect);
                gfx.DrawRectangle(new XPen(borderColor), headerRect);

                // Draw header text
                gfx.DrawString("ID", boldFont, textColor, col1X + 5, startY + 16);
                gfx.DrawString("Device Name", boldFont, textColor, col2X + 5, startY + 16);
                gfx.DrawString("Model", boldFont, textColor, col3X + 5, startY + 16);
                gfx.DrawString("Owner", boldFont, textColor, col4X + 5, startY + 16);
                gfx.DrawString("Type", boldFont, textColor, col5X + 5, startY + 16);

                // Draw data rows
                var currentY = startY + rowHeight;
                foreach (var device in devices)
                {
                    // Draw row background and border
                    var rowRect = new XRect(margin, currentY, tableWidth, rowHeight);
                    gfx.DrawRectangle(new XPen(borderColor), rowRect);

                    // Draw vertical lines for columns
                    gfx.DrawLine(new XPen(borderColor), col2X, currentY, col2X, currentY + rowHeight);
                    gfx.DrawLine(new XPen(borderColor), col3X, currentY, col3X, currentY + rowHeight);
                    gfx.DrawLine(new XPen(borderColor), col4X, currentY, col4X, currentY + rowHeight);
                    gfx.DrawLine(new XPen(borderColor), col5X, currentY, col5X, currentY + rowHeight);

                    // Draw cell data
                    gfx.DrawString(device.DeviceId.ToString(), regularFont, textColor, col1X + 5, currentY + 16);
                    gfx.DrawString(device.DeviceName ?? "N/A", regularFont, textColor, col2X + 5, currentY + 16);
                    gfx.DrawString(device.DeviceModel ?? "N/A", regularFont, textColor, col3X + 5, currentY + 16);
                    gfx.DrawString(device.DeviceOwner ?? "N/A", regularFont, textColor, col4X + 5, currentY + 16);
                    gfx.DrawString(device.DeviceType ?? "N/A", regularFont, textColor, col5X + 5, currentY + 16);

                    currentY += rowHeight;

                    // Add new page if needed
                    if (currentY > page.Height - 100)
                    {
                        page = document.AddPage();
                        page.Size = PdfSharpCore.PageSize.A4;
                        gfx = XGraphics.FromPdfPage(page);
                        currentY = 50;
                    }
                }

                // Draw summary
                currentY += 20;
                gfx.DrawString($"Total Devices: {devices.Count}", boldFont, textColor, margin, currentY);

                // Save to memory stream
                using var stream = new MemoryStream();
                document.Save(stream, false);
                return File(stream.ToArray(), "application/pdf", "device_report.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("inventory")]
        public async Task<IActionResult> GenerateInventoryReport()
        {
            try
            {
                var products = await _context.Products
                    .OrderBy(p => p.Type)
                    .ThenBy(p => p.Name)
                    .ToListAsync();

                // Create new PDF document
                var document = new PdfDocument();
                var page = document.AddPage();
                page.Size = PdfSharpCore.PageSize.A4;
                var gfx = XGraphics.FromPdfPage(page);

                // Define fonts
                var regularFont = new XFont("Arial", 10);
                var boldFont = new XFont("Arial", 10, XFontStyle.Bold);
                var titleFont = new XFont("Arial", 16, XFontStyle.Bold);
                var subtitleFont = new XFont("Arial", 12);
                var smallFont = new XFont("Arial", 8);

                // Define colors
                var headerBgColor = XColor.FromArgb(240, 240, 240);
                var borderColor = XColor.FromArgb(200, 200, 200);
                var textColor = XBrushes.Black;

                // Draw header
                gfx.DrawString("UMak Cooperative", titleFont, textColor, 40, 50);
                gfx.DrawString("Inventory Report", subtitleFont, textColor, 40, 70);
                gfx.DrawString($"Generated on: {DateTime.Now:MMMM dd, yyyy}", regularFont, textColor, 40, 90);

                var currentY = 120;
                var margin = 40;
                var rowHeight = 30;

                // Group products by type
                var groupedProducts = products.GroupBy(p => p.Type);
                foreach (var group in groupedProducts)
                {
                    // Draw type header
                    gfx.DrawString(group.Key.ToUpper(), boldFont, textColor, margin, currentY);
                    currentY += 25;

                    // Define column widths for this group
                    var col1Width = 30;    // ID
                    var col2Width = 150;   // Name & Description
                    var col3Width = 100;   // Price
                    var col4Width = 220;   // Additional Info
                    var tableWidth = col1Width + col2Width + col3Width + col4Width;

                    var col1X = margin;
                    var col2X = col1X + col1Width;
                    var col3X = col2X + col2Width;
                    var col4X = col3X + col3Width;

                    // Draw table header
                    var headerRect = new XRect(margin, currentY, tableWidth, rowHeight);
                    gfx.DrawRectangle(new XSolidBrush(headerBgColor), headerRect);
                    gfx.DrawRectangle(new XPen(borderColor), headerRect);

                    // Draw header text
                    gfx.DrawString("ID", boldFont, textColor, col1X + 5, currentY + 16);
                    gfx.DrawString("Name & Description", boldFont, textColor, col2X + 5, currentY + 16);
                    gfx.DrawString("Price", boldFont, textColor, col3X + 5, currentY + 16);
                    gfx.DrawString("Additional Info", boldFont, textColor, col4X + 5, currentY + 16);

                    currentY += rowHeight;

                    // Draw data rows
                    foreach (var product in group)
                    {
                        var rowRect = new XRect(margin, currentY, tableWidth, rowHeight);
                        gfx.DrawRectangle(new XPen(borderColor), rowRect);

                        // Draw vertical lines
                        gfx.DrawLine(new XPen(borderColor), col2X, currentY, col2X, currentY + rowHeight);
                        gfx.DrawLine(new XPen(borderColor), col3X, currentY, col3X, currentY + rowHeight);
                        gfx.DrawLine(new XPen(borderColor), col4X, currentY, col4X, currentY + rowHeight);

                        // Draw cell data
                        gfx.DrawString(product.ProductId.ToString(), regularFont, textColor, col1X + 5, currentY + 16);
                        
                        // Name & Description (2 lines)
                        gfx.DrawString(product.Name, boldFont, textColor, col2X + 5, currentY + 12);
                        gfx.DrawString(product.Description, smallFont, textColor, col2X + 5, currentY + 24);
                        
                        gfx.DrawString($"₱{product.Price:N2}", regularFont, textColor, col3X + 5, currentY + 16);

                        // Additional Info
                        var infoY = currentY + 12;
                        if (!string.IsNullOrEmpty(product.Author))
                        {
                            gfx.DrawString($"Author: {product.Author}", smallFont, textColor, col4X + 5, infoY);
                            infoY += 10;
                        }
                        if (!string.IsNullOrEmpty(product.Subject))
                        {
                            gfx.DrawString($"Subject: {product.Subject}", smallFont, textColor, col4X + 5, infoY);
                            infoY += 10;
                        }
                        if (!string.IsNullOrEmpty(product.Size))
                        {
                            gfx.DrawString($"Size: {product.Size}", smallFont, textColor, col4X + 5, infoY);
                        }
                        if (!string.IsNullOrEmpty(product.SchoolSupplyType))
                        {
                            gfx.DrawString($"Type: {product.SchoolSupplyType}", smallFont, textColor, col4X + 5, infoY);
                        }

                        currentY += rowHeight;

                        // Add new page if needed
                        if (currentY > page.Height - 100)
                        {
                            page = document.AddPage();
                            page.Size = PdfSharpCore.PageSize.A4;
                            gfx = XGraphics.FromPdfPage(page);
                            currentY = 50;
                        }
                    }

                    currentY += 20; // Space between groups
                }

                // Draw summary
                currentY += 10;
                gfx.DrawString($"Total Products: {products.Count}", boldFont, textColor, margin, currentY);

                // Save to memory stream
                using var stream = new MemoryStream();
                document.Save(stream, false);
                return File(stream.ToArray(), "application/pdf", "inventory_report.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GenerateTransactionReport()
        {
            try
            {
                var transactions = await _context.Transactions
                    .Include(t => t.Order)
                    .OrderByDescending(t => t.CompletedAt)
                    .ToListAsync();

                // Create new PDF document
                var document = new PdfDocument();
                var page = document.AddPage();
                page.Size = PdfSharpCore.PageSize.A4;
                var gfx = XGraphics.FromPdfPage(page);

                // Define fonts
                var regularFont = new XFont("Arial", 10);
                var boldFont = new XFont("Arial", 10, XFontStyle.Bold);
                var titleFont = new XFont("Arial", 16, XFontStyle.Bold);
                var subtitleFont = new XFont("Arial", 12);

                // Define colors
                var headerBgColor = XColor.FromArgb(240, 240, 240);
                var borderColor = XColor.FromArgb(200, 200, 200);
                var textColor = XBrushes.Black;

                // Draw header
                gfx.DrawString("UMak Cooperative", titleFont, textColor, 40, 50);
                gfx.DrawString("Transaction Report", subtitleFont, textColor, 40, 70);
                gfx.DrawString($"Generated on: {DateTime.Now:MMMM dd, yyyy}", regularFont, textColor, 40, 90);

                // Draw table header
                var startY = 120;
                var rowHeight = 25;
                var margin = 40;
                var col1Width = 80;    // Queue #
                var col2Width = 100;   // Amount
                var col3Width = 100;   // Payment Method
                var col4Width = 120;   // Completed By
                var col5Width = 140;   // Completed At
                var tableWidth = col1Width + col2Width + col3Width + col4Width + col5Width;

                var col1X = margin;
                var col2X = col1X + col1Width;
                var col3X = col2X + col2Width;
                var col4X = col3X + col3Width;
                var col5X = col4X + col4Width;

                // Draw header background
                var headerRect = new XRect(margin, startY, tableWidth, rowHeight);
                gfx.DrawRectangle(new XSolidBrush(headerBgColor), headerRect);
                gfx.DrawRectangle(new XPen(borderColor), headerRect);

                // Draw header text
                gfx.DrawString("Queue #", boldFont, textColor, col1X + 5, startY + 16);
                gfx.DrawString("Amount", boldFont, textColor, col2X + 5, startY + 16);
                gfx.DrawString("Payment", boldFont, textColor, col3X + 5, startY + 16);
                gfx.DrawString("Completed By", boldFont, textColor, col4X + 5, startY + 16);
                gfx.DrawString("Completed At", boldFont, textColor, col5X + 5, startY + 16);

                // Draw data rows
                var currentY = startY + rowHeight;
                decimal totalAmount = 0;

                foreach (var transaction in transactions)
                {
                    // Draw row background and border
                    var rowRect = new XRect(margin, currentY, tableWidth, rowHeight);
                    gfx.DrawRectangle(new XPen(borderColor), rowRect);

                    // Draw vertical lines for columns
                    gfx.DrawLine(new XPen(borderColor), col2X, currentY, col2X, currentY + rowHeight);
                    gfx.DrawLine(new XPen(borderColor), col3X, currentY, col3X, currentY + rowHeight);
                    gfx.DrawLine(new XPen(borderColor), col4X, currentY, col4X, currentY + rowHeight);
                    gfx.DrawLine(new XPen(borderColor), col5X, currentY, col5X, currentY + rowHeight);

                    // Draw cell data
                    gfx.DrawString(transaction.QueueNumber ?? "N/A", regularFont, textColor, col1X + 5, currentY + 16);
                    gfx.DrawString(transaction.Order?.Total != null ? $"₱{transaction.Order.Total:N2}" : "N/A", regularFont, textColor, col2X + 5, currentY + 16);
                    gfx.DrawString(transaction.Order?.PaymentMethod ?? "N/A", regularFont, textColor, col3X + 5, currentY + 16);
                    gfx.DrawString(transaction.CompletedBy ?? "N/A", regularFont, textColor, col4X + 5, currentY + 16);
                    gfx.DrawString(transaction.CompletedAt.ToLocalTime().ToString("MM/dd/yyyy HH:mm"), regularFont, textColor, col5X + 5, currentY + 16);

                    if (transaction.Order?.Total != null)
                    {
                        totalAmount += transaction.Order.Total;
                    }

                    currentY += rowHeight;

                    // Add new page if needed
                    if (currentY > page.Height - 100)
                    {
                        page = document.AddPage();
                        page.Size = PdfSharpCore.PageSize.A4;
                        gfx = XGraphics.FromPdfPage(page);
                        currentY = 50;
                    }
                }

                // Draw summary
                currentY += 20;
                gfx.DrawString($"Total Transactions: {transactions.Count}", boldFont, textColor, margin, currentY);
                gfx.DrawString($"Total Amount: ₱{totalAmount:N2}", boldFont, textColor, margin, currentY + 20);

                // Save to memory stream
                using var stream = new MemoryStream();
                document.Save(stream, false);
                return File(stream.ToArray(), "application/pdf", "transaction_report.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("UMak Cooperative")
                        .FontSize(20)
                        .Bold();
                    column.Item().Text(DateTime.Now.ToString("MM/dd/yyyy"))
                        .FontSize(10);
                });
            });
        }
    }
}