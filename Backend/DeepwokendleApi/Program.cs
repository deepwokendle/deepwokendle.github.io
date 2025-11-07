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

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll",
                policy => policy
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader());
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
            });

        builder.Services.AddAuthorization();
        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        app.UseCors("AllowAll");
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        await app.RunAsync();
    }
}
