using back.Entities;
using MongoDB.Driver;
using Microsoft.Extensions.Options;

namespace back.Configuration;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbConfiguration> configuration)
    {
        MongoClient client = new MongoClient(configuration.Value.ConnectionString);
        _database = client.GetDatabase(configuration.Value.DatabaseName);
    }

    public IMongoCollection<Usuario> Usuarios => _database.GetCollection<Usuario>("Usuarios");
    public IMongoCollection<Producto> Productos => _database.GetCollection<Producto>("Productos");
}
