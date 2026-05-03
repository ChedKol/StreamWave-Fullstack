using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using Repository.Repositories;
using Service.Interfaces;
using Service.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DAL;

namespace OurWebApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Controllers
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            // Swagger עם תמיכה ב-JWT
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "הכנס טוקן: Bearer {token}",
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
                });
                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            // DbContext
            builder.Services.AddDbContext<OurContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), b => b.MigrationsAssembly("Dal")));

            // DI — חיבור ממשקים למימושים
            builder.Services.AddScoped<IContext, OurContext>();


            builder.Services.AddScoped<IRepository<Repository.Entities.User>, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();

            builder.Services.AddScoped<ILogin, LoginService>();


            builder.Services.AddScoped<IRepository<Repository.Entities.Song>, SongRepository>();
            builder.Services.AddScoped<ISongService, SongService>();


            builder.Services.AddScoped<IRepository<Repository.Entities.Artist>, ArtistRepository>();
            builder.Services.AddScoped<IArtistService, ArtistService>();


            builder.Services.AddScoped<IRepository<Repository.Entities.Playlist>, PlaylistRepository>();
            builder.Services.AddScoped<IPlaylistService, PlaylistService>();

            // DI — חיבור ממשקים למימושים
            builder.Services.AddScoped<ISearchService, SearchService>(); // <--- הוסיפי את זה כאן
            // AutoMapper
            builder.Services.AddAutoMapper(typeof(MyMapper));

            // JWT
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
                    };
                });

            // CORS — לאפשר לReact לדבר עם השרת
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            });

            // יצירת תיקיות אוטומטית אם לא קיימות
            var imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "Images");
            var musicPath = Path.Combine(Directory.GetCurrentDirectory(), "Music");
            if (!Directory.Exists(imagesPath)) Directory.CreateDirectory(imagesPath);
            if (!Directory.Exists(musicPath)) Directory.CreateDirectory(musicPath);

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}