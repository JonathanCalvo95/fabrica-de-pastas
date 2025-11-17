using MongoDB.Driver;
using back.Configuration;
using back.Entities;
using back.Enums;

namespace back.Repositories;

public class PedidoRepository(MongoDbContext ctx) : IPedidoRepository
{
    private readonly IMongoCollection<Pedido> _col = ctx.Pedidos;

    public async Task<string> AddAsync(Pedido p)
    {
        await _col.InsertOneAsync(p);
        return p.Id;
    }

    public async Task<Pedido?> GetByIdAsync(string id)
    {
        var f = Builders<Pedido>.Filter.Eq(x => x.Id, id);
        return await _col.Find(f).FirstOrDefaultAsync();
    }

    public async Task<List<Pedido>> GetAllAsync(EstadoPedido[]? estados = null)
    {
        FilterDefinition<Pedido> filter = Builders<Pedido>.Filter.Empty;
        if (estados is { Length: > 0 })
        {
            filter = Builders<Pedido>.Filter.In(x => x.Estado, estados);
        }

        return await _col.Find(filter)
                         .SortByDescending(x => x.Fecha)
                         .ToListAsync();
    }

    public Task UpdateAsync(Pedido p)
    {
        var f = Builders<Pedido>.Filter.Eq(x => x.Id, p.Id);
        return _col.ReplaceOneAsync(f, p);
    }

    public Task DeleteAsync(string id)
    {
        var f = Builders<Pedido>.Filter.Eq(x => x.Id, id);
        return _col.DeleteOneAsync(f);
    }
}
