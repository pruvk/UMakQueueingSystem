using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Server.Data;
using Server.Models;
using Server.DTOs;

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
            .WithOrigins("http://localhost:5173") // Your React app URL
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Add DB Context
builder.Services.AddDbContext<AuthDbContext>(options =>
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
    catch (Exception ex)
    {
        return Results.StatusCode(500);
    }
});

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
            Username = "test",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("test123"),
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(testUser);
        await db.SaveChangesAsync();
    }
}

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
