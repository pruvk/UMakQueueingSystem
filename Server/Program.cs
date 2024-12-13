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
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();
});

// Configure DbContext
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "UMak Queue API", Version = "v1" });
    
    // Add JWT Authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

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
        builder =>
        {
            builder
                .SetIsOriginAllowed(_ => true)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

// Other service configurations...

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");  // Before auth middleware
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
    try 
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.UserId == id);
        if (user == null)
        {
            return Results.NotFound(new { message = "User not found" });
        }

        // Only update the fields that are meant to be updated
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
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
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

app.MapControllers();
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

// Add this with your other queue-related endpoints
app.MapPost("/api/queue/{queueNumber}/cancel", [Authorize(Roles = "staff")] async (string queueNumber, AuthDbContext db) =>
{
    try
    {
        var queue = await db.Queues
            .Include(q => q.Order)
            .FirstOrDefaultAsync(q => q.QueueNumber == queueNumber && q.Status == "serving");

        if (queue == null)
        {
            return Results.NotFound(new ApiResponse<string>
            {
                Success = false,
                Message = $"Queue {queueNumber} not found or not currently being served",
                Data = default
            });
        }

        // Update queue status
        queue.Status = "cancelled";
        queue.CompletedAt = DateTime.UtcNow;

        // Reset cashier's current number if assigned
        if (queue.CashierId.HasValue)
        {
            var cashier = await db.Cashiers.FindAsync(queue.CashierId.Value);
            if (cashier != null)
            {
                cashier.CurrentNumber = "0000";
            }
        }

        await db.SaveChangesAsync();

        return Results.Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Queue cancelled successfully",
            Data = default
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new ApiResponse<string>
        {
            Success = false,
            Message = "Failed to cancel queue",
            Error = ex.Message,
            Data = default
        }, statusCode: 500);
    }
});
