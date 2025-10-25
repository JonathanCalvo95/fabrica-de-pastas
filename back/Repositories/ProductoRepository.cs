using MongoDB.Driver;
using back.Configuration;
using back.Entities;

namespace back.Repositories;

public class ProductoRepository(MongoDbContext context) : IProductoRepository
{
    private readonly IMongoCollection<Producto> _productos = context.Productos;

    public async Task<IEnumerable<Producto>> GetAllAsync(bool activos = true)
    {
        var filter = activos
            ? Builders<Producto>.Filter.Eq(p => p.Activo, true)
            : Builders<Producto>.Filter.Empty;

        return await _productos.Find(filter).ToListAsync();
    }

    public async Task<Producto?> GetByIdAsync(string id)
    {
        FilterDefinition<Producto> filter = Builders<Producto>.Filter.Eq(p => p.Id, id);
        return await _productos.Find(filter).FirstOrDefaultAsync();
    }

    public async Task AddAsync(Producto producto)
    {
        await _productos.InsertOneAsync(producto);
    }

    public async Task<bool> UpdateAsync(string id, Producto producto)
    {
        producto.FechaActualizacion = DateTime.UtcNow;
        FilterDefinition<Producto> filter = Builders<Producto>.Filter.Eq(p => p.Id, id);
        ReplaceOneResult updateResult = await _productos.ReplaceOneAsync(filter, producto);
        return updateResult.IsAcknowledged && updateResult.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var filter = Builders<Producto>.Filter.Eq(p => p.Id, id);
        var update = Builders<Producto>.Update
            .Set(p => p.Activo, false)
            .Set(p => p.FechaActualizacion, DateTime.UtcNow);

        var result = await _productos.UpdateOneAsync(filter, update);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }

    public async Task<(bool ok, string? descripcion, decimal precio, double stockRestante)>
        DecrementStockIfEnoughAsync(string productoId, double cantidad)
    {
        var filter = Builders<Producto>.Filter.Where(p => p.Id == productoId && p.Activo && p.Stock >= cantidad);
        var update = Builders<Producto>.Update.Inc(p => p.Stock, -cantidad)
                                              .Set(p => p.FechaActualizacion, DateTime.UtcNow);

        var options = new FindOneAndUpdateOptions<Producto>
        {
            ReturnDocument = ReturnDocument.After
        };

        var updated = await _productos.FindOneAndUpdateAsync(filter, update, options);

        if (updated is null) return (false, null, 0m, 0);

        return (true, updated.Descripcion, updated.Precio, updated.Stock);
    }

    public async Task<IEnumerable<Producto>> GetInfoAsync(IEnumerable<string> ids)
    {
        var set = ids.ToHashSet();
        var list = await _productos.Find(p => set.Contains(p.Id)).ToListAsync();
        return list;
    }
}
