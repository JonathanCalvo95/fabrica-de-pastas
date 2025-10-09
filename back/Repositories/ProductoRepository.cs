using MongoDB.Driver;
using back.Configuration;
using back.Entities;

namespace back.Repositories;

public class ProductoRepository(MongoDbContext context) : IProductoRepository
{
    private readonly IMongoCollection<Producto> _productos = context.Productos;

    public async Task<IEnumerable<Producto>> GetAllAsync()
    {
        return await _productos.Find(_ => true).ToListAsync();
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
        FilterDefinition<Producto> filter = Builders<Producto>.Filter.Eq(p => p.Id, id);
        DeleteResult deleteResult = await _productos.DeleteOneAsync(filter);
        return deleteResult.IsAcknowledged && deleteResult.DeletedCount > 0;
    }
}
