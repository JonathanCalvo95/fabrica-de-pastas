using MongoDB.Driver;
using back.Configuration;
using back.Entities;
using back.Enums;

namespace back.Repositories;

public class VentaRepository(MongoDbContext ctx) : IVentaRepository
{
    private readonly IMongoCollection<Venta> _col = ctx.Ventas;

    public Task AddAsync(Venta v) => _col.InsertOneAsync(v);

    public async Task<Venta?> GetByIdAsync(string id)
    {
        var f = Builders<Venta>.Filter.Eq(x => x.Id, id);
        return await _col.Find(f).FirstOrDefaultAsync();
    }

    public async Task<List<Venta>> GetLastAsync(int take = 50)
    {
        return await _col.Find(Builders<Venta>.Filter.Empty)
                         .SortByDescending(x => x.Fecha)
                         .Limit(take)
                         .ToListAsync();
    }

    public async Task<List<Venta>> GetByCajaIdAsync(string cajaId)
    {
        var f = Builders<Venta>.Filter.Eq(x => x.CajaId, cajaId);
        return await _col.Find(f)
                         .SortByDescending(x => x.Fecha)
                         .ToListAsync();
    }

    public async Task<List<Venta>> GetByDateRangeAsync(DateTime fromUtc, DateTime toUtc, EstadoVenta[]? estados = null)
    {
        var builder = Builders<Venta>.Filter;
        var fFecha = builder.Gte(x => x.Fecha, fromUtc) & builder.Lte(x => x.Fecha, toUtc);

        FilterDefinition<Venta> fEstado = FilterDefinition<Venta>.Empty;
        if (estados is { Length: > 0 })
            fEstado = builder.In(x => x.Estado, estados);

        var filter = fFecha & fEstado;

        return await _col.Find(filter)
                         .SortBy(x => x.Fecha)
                         .ToListAsync();
    }

    public Task UpdateEstadoAsync(string id, EstadoVenta estado)
    {
        var f = Builders<Venta>.Filter.Eq(x => x.Id, id);
        var u = Builders<Venta>.Update.Set(x => x.Estado, estado);
        return _col.UpdateOneAsync(f, u);
    }
}
