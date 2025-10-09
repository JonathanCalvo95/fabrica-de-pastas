using back.Entities;
using MongoDB.Driver;

namespace back.Configuration;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(MongoDbConfiguration configuration)
    {
        MongoClient client = new MongoClient(configuration.ConnectionString);
        _database = client.GetDatabase(configuration.DatabaseName);
    }

    public IMongoCollection<Usuario> Usuarios => _database.GetCollection<Usuario>("Usuarios");
    public IMongoCollection<Producto> Productos => _database.GetCollection<Producto>("Productos");
}
