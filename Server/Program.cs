using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Server.Data;
using Server.Models;
using Server.DTOs;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Authorization and Authentication services
builder.Services.AddAuthorization();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// Add DB Context
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

// Auth endpoints
app.MapPost("/api/auth/register", async (RegisterDto registerDto, AuthDbContext context) =>
{
    if (await context.Users.AnyAsync(u => u.Username == registerDto.Username))
        return Results.BadRequest("Username already exists");

    var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
    var user = new User
    {
        Username = registerDto.Username,
        PasswordHash = passwordHash,
        CreatedAt = DateTime.UtcNow
    };

    context.Users.Add(user);
    await context.SaveChangesAsync();

    return Results.Ok("User registered successfully");
})
.WithName("Register")
.WithOpenApi();

app.MapPost("/api/auth/login", async (LoginDto loginDto, AuthDbContext db) =>
{
    try 
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);
        
        if (user == null)
            return Results.BadRequest(new { message = "User not found" });

        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            return Results.BadRequest(new { message = "Invalid password" });

        var token = CreateToken(user, builder.Configuration);
        
        return Results.Ok(new { token });
    }
    catch (Exception)
    {
        return Results.StatusCode(500);
    }
});

app.MapPost("/api/device/login", async (LoginDto loginDto, AuthDbContext db) =>
{
    try 
    {
        var device = await db.Devices.FirstOrDefaultAsync(d => d.Username == loginDto.Username);
        
        if (device == null)
            return Results.BadRequest(new { message = "Device not found" });

        // Simple password comparison for devices
        if (device.Password != loginDto.Password)
            return Results.BadRequest(new { message = "Invalid password" });

        // Create a device-specific token
        var token = CreateDeviceToken(device, builder.Configuration);

        return Results.Ok(new { 
            token,
            deviceId = device.DeviceId,
            deviceName = device.DeviceName,
            deviceType = device.DeviceType,
            message = "Device authenticated successfully"
        });
    }
    catch (Exception ex)
    {
        // Log the error
        Console.WriteLine($"Device login error: {ex.Message}");
        return Results.StatusCode(500);
    }
});

// Define device-specific token creation
string CreateDeviceToken(Device device, IConfiguration configuration)
{
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
        configuration.GetSection("AppSettings:Token").Value!.PadRight(64, '_')));

    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    // Device-specific claims
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, device.Username),
        new Claim(ClaimTypes.NameIdentifier, device.DeviceId.ToString()),
        new Claim(ClaimTypes.Role, "device"),
        new Claim("DeviceType", device.DeviceType),
        new Claim("DeviceName", device.DeviceName),
        new Claim("DeviceOwner", device.DeviceOwner),
    };

    var token = new JwtSecurityToken(
        issuer: "UMakQueueingSystem",
        audience: "Devices",
        claims: claims,
        expires: DateTime.Now.AddHours(12), // Shorter expiration for devices
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    
    // Ensure database is created
    db.Database.EnsureCreated();
    
    // Check if we need to seed a test user
    if (!db.Users.Any())
    {
        var testUser = new User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234"),
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(testUser);
        await db.SaveChangesAsync();
    }
}

app.MapGet("/api/users", [Authorize(Roles = "admin")] async (AuthDbContext db) =>
{
    var users = await db.Users
        .Where(u => u.Role == "staff")
        .Select(u => new
        {
            u.UserId,
            u.Username,
            u.FirstName,
            u.MiddleName,
            u.LastName,
            u.Role,
            Status = "Active",
            u.CreatedAt
        })
        .ToListAsync();
    
    return Results.Ok(users);
});

app.MapPost("/api/users", [Authorize(Roles = "admin")] async (RegisterDto registerDto, AuthDbContext db) =>
{
    if (await db.Users.AnyAsync(u => u.Username == registerDto.Username))
    {
        return Results.BadRequest("Username already exists");
    }

    var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
    var user = new User
    {
        Username = registerDto.Username,
        PasswordHash = passwordHash,
        Role = "staff",
        FirstName = registerDto.FirstName,
        MiddleName = registerDto.MiddleName,
        LastName = registerDto.LastName
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        user.UserId,
        user.Username,
        user.FirstName,
        user.MiddleName,
        user.LastName,
        user.Role,
        user.CreatedAt
    });
});

app.MapPut("/api/users/{id}", [Authorize(Roles = "admin")] async (int id, UserUpdateDto updateDto, AuthDbContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == id);
    if (user == null)
    {
        return Results.NotFound("User not found");
    }

    user.FirstName = updateDto.FirstName;
    user.MiddleName = updateDto.MiddleName;
    user.LastName = updateDto.LastName;

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        user.UserId,
        user.Username,
        user.FirstName,
        user.MiddleName,
        user.LastName,
        user.Role,
        user.CreatedAt
    });
});

app.MapDelete("/api/users/{id}", [Authorize(Roles = "admin")] async (int id, AuthDbContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == id);
    if (user == null)
    {
        return Results.NotFound("User not found");
    }

    db.Users.Remove(user);
    await db.SaveChangesAsync();

    return Results.Ok();
});

// Get all devices
app.MapGet("/api/devices", [Authorize(Roles = "admin")] async (AuthDbContext db) =>
{
    var devices = await db.Devices.Select(d => new
    {
        d.DeviceId,
        d.Username,
        d.DeviceName,
        d.DeviceModel,
        d.DeviceOwner,
        d.DeviceType,
        d.CreatedAt
    }).ToListAsync();
    
    return Results.Ok(devices);
});

// Add new device
app.MapPost("/api/devices", [Authorize(Roles = "admin")] async (DeviceDto deviceDto, AuthDbContext db) =>
{
    var device = new Device
    {
        Username = deviceDto.Username,
        Password = deviceDto.Password,
        DeviceName = deviceDto.DeviceName,
        DeviceModel = deviceDto.DeviceModel,
        DeviceOwner = deviceDto.DeviceOwner,
        DeviceType = deviceDto.DeviceType.ToLower(),
    };

    db.Devices.Add(device);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        device.DeviceId,
        device.Username,
        device.DeviceName,
        device.DeviceModel,
        device.DeviceOwner,
        device.DeviceType,
        device.CreatedAt
    });
});

// Update device
app.MapPut("/api/devices/{id}", [Authorize(Roles = "admin")] async (int id, DeviceUpdateDto updateDto, AuthDbContext db) =>
{
    var device = await db.Devices.FindAsync(id);
    if (device == null)
        return Results.NotFound("Device not found");

    device.Username = updateDto.Username;
    device.DeviceName = updateDto.DeviceName;
    device.DeviceModel = updateDto.DeviceModel;
    device.DeviceOwner = updateDto.DeviceOwner;
    device.DeviceType = updateDto.DeviceType.ToLower();

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        device.DeviceId,
        device.Username,
        device.DeviceName,
        device.DeviceModel,
        device.DeviceOwner,
        device.DeviceType,
        device.CreatedAt
    });
});

// Delete device
app.MapDelete("/api/devices/{id}", [Authorize(Roles = "admin")] async (int id, AuthDbContext db) =>
{
    var device = await db.Devices.FindAsync(id);
    if (device == null)
        return Results.NotFound("Device not found");

    db.Devices.Remove(device);
    await db.SaveChangesAsync();

    return Results.Ok();
});

app.MapPost("/api/products", async (AuthDbContext db, ProductDto productDto, HttpContext context) =>
{
    var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userId == null) return Results.Unauthorized();

    // If the imageUrl starts with "data:image", it's a base64 image
    string? finalImageUrl = productDto.ImageUrl;
    if (productDto.ImageUrl?.StartsWith("data:image") == true)
    {
        // Store the base64 string directly
        finalImageUrl = productDto.ImageUrl;
    }

    var product = new Product
    {
        UserId = int.Parse(userId),
        Name = productDto.Name,
        Description = productDto.Description,
        Price = productDto.Price,
        Type = productDto.Type,
        Author = productDto.Author,
        Subject = productDto.Subject,
        Size = productDto.Size,
        SchoolSupplyType = productDto.SchoolSupplyType,
        ImageUrl = finalImageUrl
    };

    db.Products.Add(product);
    await db.SaveChangesAsync();
    return Results.Ok(product);
})
.RequireAuthorization(policy => policy.RequireRole("staff"));

app.MapGet("/api/products", async (AuthDbContext db, HttpContext context, string? search, string? type) =>
{
    var query = db.Products.AsQueryable();

    if (!string.IsNullOrEmpty(search))
    {
        query = query.Where(p => 
            p.Name.ToLower().Contains(search.ToLower()) ||
            p.Description.ToLower().Contains(search.ToLower()) ||
            (p.Author != null && p.Author.ToLower().Contains(search.ToLower()))
        );
    }

    if (!string.IsNullOrEmpty(type) && type != "all")
    {
        query = query.Where(p => p.Type == type);
    }

    var products = await query
        .Select(p => new {
            id = p.ProductId,
            name = p.Name,
            description = p.Description,
            price = p.Price,
            type = p.Type,
            author = p.Author,
            subject = p.Subject,
            size = p.Size,
            schoolSupplyType = p.SchoolSupplyType,
            imageUrl = p.ImageUrl,
            createdAt = p.CreatedAt
        })
        .OrderByDescending(p => p.createdAt)
        .ToListAsync();

    return Results.Ok(products);
})
.AllowAnonymous();

app.MapPut("/api/products/{id}", async (AuthDbContext db, int id, ProductUpdateDto updateDto) =>
{
    var product = await db.Products.FindAsync(id);
    if (product == null) return Results.NotFound();

    product.Name = updateDto.Name;
    product.Description = updateDto.Description;
    product.Price = updateDto.Price;
    product.Type = updateDto.Type;
    product.Author = updateDto.Author;
    product.Subject = updateDto.Subject;
    product.Size = updateDto.Size;
    product.SchoolSupplyType = updateDto.SchoolSupplyType;
    product.ImageUrl = updateDto.ImageUrl;

    await db.SaveChangesAsync();
    return Results.Ok(product);
})
.RequireAuthorization(policy => policy.RequireRole("staff"));

app.MapDelete("/api/products/{id}", async (AuthDbContext db, int id) =>
{
    var product = await db.Products.FindAsync(id);
    if (product == null) return Results.NotFound();

    db.Products.Remove(product);
    await db.SaveChangesAsync();
    return Results.Ok();
})
.RequireAuthorization(policy => policy.RequireRole("staff"));

// Get all cashiers
app.MapGet("/api/cashier", async (ApplicationDbContext db) =>
{
    try
    {
        // First check if we can access the database
        if (db == null)
        {
            return Results.Problem("Database context is null");
        }

        // Try to access the Cashiers table
        if (db.Cashiers == null)
        {
            return Results.Problem("Cashiers DbSet is null");
        }

        var cashiers = await db.Cashiers.ToListAsync();
        return Results.Ok(cashiers ?? new List<Cashier>());  // Return empty list if null
    }
    catch (Exception ex)
    {
        // Log the full exception details
        Console.WriteLine($"Error fetching cashiers: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return Results.Problem(ex.Message);
    }
})
.WithName("GetCashiers")
.WithOpenApi();

// Add new cashier
app.MapPost("/api/cashier", async (Cashier cashier, ApplicationDbContext db) =>
{
    var count = await db.Cashiers.CountAsync();
    if (count >= 9)
    {
        return Results.BadRequest("Maximum number of cashiers reached");
    }

    db.Cashiers.Add(cashier);
    await db.SaveChangesAsync();
    return Results.Ok(cashier);
})
.WithName("CreateCashier")
.WithOpenApi();

// Delete cashier
app.MapDelete("/api/cashier/{id}", async (int id, ApplicationDbContext db) =>
{
    var cashier = await db.Cashiers.FindAsync(id);
    if (cashier == null)
        return Results.NotFound();

    db.Cashiers.Remove(cashier);
    await db.SaveChangesAsync();
    return Results.Ok();
})
.WithName("DeleteCashier")
.WithOpenApi();

app.Run();

// Helper method to create JWT token
string CreateToken(User user, IConfiguration configuration)
{
    // Generate a key that's at least 64 bytes (512 bits) for HMAC-SHA512
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
        configuration.GetSection("AppSettings:Token").Value!.PadRight(64, '_')));

    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); // Changed to SHA256

    var token = new JwtSecurityToken(
        claims: new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        },
        expires: DateTime.Now.AddDays(1),
        signingCredentials: creds);

    return new JwtSecurityTokenHandler().WriteToken(token);
}
