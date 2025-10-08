using FabricaDePastas.Back.Entities;
using MongoDB.Driver;

namespace FabricaDePastas.Back.Data;

public class ProductoRepoMongo : IProductoRepo
{
    private readonly IMongoCollection<Producto> _col;

    public ProductoRepoMongo(MongoDb mongo)
    {
        _col = mongo.Productos;
    }

    public IEnumerable<Producto> GetAll()
        => _col.Find(FilterDefinition<Producto>.Empty).ToList();

    public Producto? GetById(string id)
        => _col.Find(x => x.Id == id).FirstOrDefault();

    public Producto Add(Producto p)
    {
        // Si viene null, Mongo genera Id automáticamente
        _col.InsertOne(p);
        return p;
    }

    public bool Update(string id, Producto p)
    {
        p.Id = id; // aseguramos coherencia
        var result = _col.ReplaceOne(x => x.Id == id, p);
        return result.MatchedCount > 0 && result.ModifiedCount > 0;
    }

    public bool Delete(string id)
    {
        var result = _col.DeleteOne(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}
