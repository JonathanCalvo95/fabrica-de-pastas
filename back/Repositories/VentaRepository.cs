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

    public async Task<decimal> GetTotalEfectivoDesdeAsync(DateTime desdeUtc)
    {
        var f = Builders<Venta>.Filter.Gte(v => v.Fecha, desdeUtc) &
                Builders<Venta>.Filter.Eq(v => v.MetodoPago, MetodoPago.Efectivo) &
                Builders<Venta>.Filter.Eq(v => v.Estado, EstadoVenta.Confirmada);

        var total = _col.AsQueryable()
                              .Where(v => v.Fecha >= desdeUtc &&
                                          v.MetodoPago == MetodoPago.Efectivo &&
                                          v.Estado == EstadoVenta.Confirmada)
                              .Select(v => v.Total)
                              .ToList();

        return total.Sum();
    }
}
