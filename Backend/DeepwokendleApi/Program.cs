using DeepwokendleApi.Hubs;
using DeepwokendleApi.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddSwaggerGen(c =>
        {
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Please provide the generated JWT token from /api/auth/login. Format: Bearer {your_token}"
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
        var allowedOrigins = new[] {
            "http://localhost:8080",         
            "http://192.168.1.184:8080",     
            "https://deepwokendle.github.io",
            "https://www.deepwokendle.com",
            "https://deepwokendle.onrender.com"
        };
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("CorsWithCredentials", policy =>
            {
                policy
                    .WithOrigins(allowedOrigins) 
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        #region [Loot]
        builder.Services.AddScoped<ILootService, LootService>();
        #region [LootCategory]
        builder.Services.AddScoped<ILootCategoryService, LootCategoryService>();
        #endregion [LootCategory]
        #endregion [Loot]

        #region [Bucket]
        builder.Services.AddHttpClient<ISupabaseStorageService, SupabaseStorageService>();
        #endregion [Bucket]

        #region [Location]
        builder.Services.AddScoped<ILocationService, LocationService>();
        #endregion [Location]

        #region [Category]
        builder.Services.AddScoped<ICategoryService, CategoryService>();
        #endregion [Category]

        #region [Element]
        builder.Services.AddScoped<IElementService, ElementService>();
        #endregion [Element]

        #region [Monster]
        builder.Services.AddScoped<IMonsterService, MonsterService>();
        #endregion [Monster]

        #region [Attempt]
        builder.Services.AddScoped<IAttemptService, AttemptService>();
        #endregion [Attempt]

        #region [User]
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<ITokenService, TokenService>();
        #endregion [User]

        #region [Leaderboard]
        builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
        #endregion [Leaderboard]

        builder.Services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    RequireExpirationTime = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
                    ),
                    ClockSkew = TimeSpan.Zero
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"].FirstOrDefault();
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddAuthorization();
        builder.Services.AddSignalR();
        var app = builder.Build();
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseRouting();

        app.Use(async (context, next) =>
        {
            if (string.Equals(context.Request.Method, "OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                var origin = context.Request.Headers["Origin"].FirstOrDefault();
                if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
                {
                    context.Response.StatusCode = 200;
                    context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                    context.Response.Headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS";
                    context.Response.Headers["Access-Control-Allow-Headers"] = context.Request.Headers["Access-Control-Request-Headers"].FirstOrDefault() ?? "*";
                    await context.Response.CompleteAsync();
                    return;
                }
            }
            await next();
        });

        app.UseCors("CorsWithCredentials");
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapHub<ChatHub>("api/chatHub");

        await app.RunAsync();
    }
}
