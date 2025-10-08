using FabricaDePastas.Back.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace FabricaDePastas.Back.Data;

public class MongoDb
{
    private readonly IMongoDatabase _db;
    private readonly MongoOptions _opts;

    public MongoDb(IOptions<MongoOptions> opts)
    {
        _opts = opts.Value;
        var client = new MongoClient(_opts.ConnectionString);
        _db = client.GetDatabase(_opts.Database);

        // índices recomendados (ejemplo):
        var prod = Productos;
        var keys = Builders<Producto>.IndexKeys.Ascending(x => x.Nombre);
        prod.Indexes.CreateOne(new CreateIndexModel<Producto>(keys));
    }

    public IMongoCollection<Producto> Productos =>
        _db.GetCollection<Producto>(_opts.Collections.Productos);
}
