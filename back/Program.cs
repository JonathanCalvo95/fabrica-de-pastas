using System.Text;
using back.Configuration;
using back.Repositories;
using back.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using back.Migrations;

var builder = WebApplication.CreateBuilder(args);

// Config Mongo
builder.Services.Configure<MongoDbConfiguration>(builder.Configuration.GetSection("MongoDbConfiguration"));
builder.Services.AddSingleton<MongoDbContext>();

// Repositorios
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IProductoRepository, ProductoRepository>();
builder.Services.AddScoped<ICajaRepository, CajaRepository>();
builder.Services.AddScoped<IVentaRepository, VentaRepository>();
builder.Services.AddScoped<IPedidoRepository, PedidoRepository>();

// Servicios
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<ICajaService, CajaService>();
builder.Services.AddScoped<IVentaService, VentaService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Auth JWT
string? jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 16)
    throw new InvalidOperationException("Configura Jwt:Key (>=16 chars).");

builder.Services
    .AddAuthentication(o =>
    {
        o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
const string corsPolicy = "_myCorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy, p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// MIGRACIONES
builder.Services.AddSingleton<IMigration, M001_SeedUsuarios>();
builder.Services.AddSingleton<IMigration, M002_SeedProductos>();
builder.Services.AddSingleton<IMigration, M003_SeedCajasVentas>();
builder.Services.AddSingleton<IMigration, M004_SeedPedidos>();
builder.Services.AddSingleton(sp =>
{
    var ctx = sp.GetRequiredService<MongoDbContext>();
    var migrations = sp.GetServices<IMigration>();
    return new MigrationRunner(ctx.Database, migrations);
});

var app = builder.Build();

// Middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(corsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// EJECUTA MIGRACIONES AL INICIO
using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    var runner = sp.GetRequiredService<MigrationRunner>();
    await runner.RunAsync(sp);
}

app.Run();
