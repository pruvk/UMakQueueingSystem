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

                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Header().Element(ComposeHeader);
                        
                        page.Content().Element(container =>
                        {
                            container.Table(table =>
                            {
                                // Define columns
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                // Add header row
                                table.Header(header =>
                                {
                                    header.Cell().Text("ID");
                                    header.Cell().Text("Name");
                                    header.Cell().Text("Username");
                                    header.Cell().Text("Created At");
                                });

                                // Add data rows
                                foreach (var staff in staffMembers)
                                {
                                    table.Cell().Text(staff.UserId);
                                    table.Cell().Text($"{staff.FirstName} {staff.LastName}");
                                    table.Cell().Text(staff.Username);
                                    table.Cell().Text(staff.CreatedAt.ToLocalTime().ToString("MM/dd/yyyy"));
                                }
                            });
                        });

                        page.Footer()
                            .AlignCenter()
                            .Text(x =>
                            {
                                x.Span("Page ");
                                x.CurrentPageNumber();
                                x.Span(" of ");
                                x.TotalPages();
                            });
                    });
                });

                byte[] pdfBytes = document.GeneratePdf();

                return File(pdfBytes, "application/pdf", "staff_report.pdf");
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

                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Header().Element(ComposeHeader);
                        
                        page.Content().Element(container =>
                        {
                            container.Table(table =>
                            {
                                // Define columns
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                // Add header row
                                table.Header(header =>
                                {
                                    header.Cell().Text("ID");
                                    header.Cell().Text("Device Name");
                                    header.Cell().Text("Model");
                                    header.Cell().Text("Owner");
                                    header.Cell().Text("Type");
                                });

                                // Add data rows
                                foreach (var device in devices)
                                {
                                    table.Cell().Text(device.DeviceId);
                                    table.Cell().Text(device.DeviceName);
                                    table.Cell().Text(device.DeviceModel);
                                    table.Cell().Text(device.DeviceOwner);
                                    table.Cell().Text(device.DeviceType);
                                }
                            });
                        });

                        page.Footer()
                            .AlignCenter()
                            .Text(x =>
                            {
                                x.Span("Page ");
                                x.CurrentPageNumber();
                                x.Span(" of ");
                                x.TotalPages();
                            });
                    });
                });

                byte[] pdfBytes = document.GeneratePdf();

                return File(pdfBytes, "application/pdf", "device_report.pdf");
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

                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Header().Element(ComposeHeader);
                        
                        page.Content().Element(container =>
                        {
                            // Group products by type
                            var groupedProducts = products.GroupBy(p => p.Type);
                            
                            foreach (var group in groupedProducts)
                            {
                                // Add type header
                                container.Column(column =>
                                {
                                    column.Item().PaddingBottom(5).Text(group.Key.ToUpper())
                                        .FontSize(16)
                                        .Bold();

                                    column.Item().Table(table =>
                                    {
                                        // Define columns
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn();
                                            columns.RelativeColumn(2); // Description gets more space
                                            columns.RelativeColumn();
                                            columns.RelativeColumn();
                                        });

                                        // Add header row
                                        table.Header(header =>
                                        {
                                            header.Cell().Text("ID");
                                            header.Cell().Text("Name & Description");
                                            header.Cell().Text("Price");
                                            header.Cell().Text("Additional Info");
                                        });

                                        // Add data rows
                                        foreach (var product in group)
                                        {
                                            table.Cell().Text(product.ProductId);
                                            table.Cell().Column(c =>
                                            {
                                                c.Item().Text(product.Name).Bold();
                                                c.Item().Text(product.Description)
                                                    .FontSize(8);
                                            });
                                            table.Cell().Text($"₱{product.Price:N2}");
                                            table.Cell().Column(c =>
                                            {
                                                if (!string.IsNullOrEmpty(product.Author))
                                                    c.Item().Text($"Author: {product.Author}");
                                                if (!string.IsNullOrEmpty(product.Subject))
                                                    c.Item().Text($"Subject: {product.Subject}");
                                                if (!string.IsNullOrEmpty(product.Size))
                                                    c.Item().Text($"Size: {product.Size}");
                                                if (!string.IsNullOrEmpty(product.SchoolSupplyType))
                                                    c.Item().Text($"Type: {product.SchoolSupplyType}");
                                            });
                                        }
                                    });
                                    
                                    column.Item().PaddingBottom(10);
                                });
                            }
                        });

                        page.Footer()
                            .AlignCenter()
                            .Text(x =>
                            {
                                x.Span("Page ");
                                x.CurrentPageNumber();
                                x.Span(" of ");
                                x.TotalPages();
                            });
                    });
                });

                byte[] pdfBytes = document.GeneratePdf();

                return File(pdfBytes, "application/pdf", "inventory_report.pdf");
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
                    .OrderByDescending(t => t.CompletedAt)
                    .ToListAsync();

                // Create new PDF document
                var document = new PdfDocument();
                var page = document.AddPage();
                var gfx = XGraphics.FromPdfPage(page);
                var font = new XFont("Arial", 12);
                var titleFont = new XFont("Arial", 20, XFontStyle.Bold);

                // Draw title
                gfx.DrawString("Transaction Report", titleFont, XBrushes.Black, new XRect(40, 40, page.Width, 50), XStringFormats.TopLeft);
                
                // Draw date
                gfx.DrawString($"Generated on: {DateTime.Now:MM/dd/yyyy}", font, XBrushes.Black, new XRect(40, 70, page.Width, 50), XStringFormats.TopLeft);

                // Draw content
                var y = 120;
                foreach (var transaction in transactions)
                {
                    gfx.DrawString($"Queue #: {transaction.QueueNumber}", font, XBrushes.Black, 40, y);
                    gfx.DrawString($"Completed By: {transaction.CompletedBy}", font, XBrushes.Black, 40, y + 20);
                    gfx.DrawString($"Completed At: {transaction.CompletedAt:MM/dd/yyyy HH:mm}", font, XBrushes.Black, 40, y + 40);
                    y += 80;

                    // Add new page if needed
                    if (y > page.Height - 100)
                    {
                        page = document.AddPage();
                        gfx = XGraphics.FromPdfPage(page);
                        y = 40;
                    }
                }

                // Save to memory stream
                var stream = new MemoryStream();
                document.Save(stream, false);
                stream.Position = 0;

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