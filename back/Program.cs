using FabricaDePastas.Back.Data;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Bind de opciones Mongo desde appsettings.json
builder.Services.Configure<MongoOptions>(builder.Configuration.GetSection("Mongo"));

// Contexto Mongo y repo
builder.Services.AddSingleton<MongoDb>();
builder.Services.AddSingleton<IProductoRepo, ProductoRepoMongo>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
