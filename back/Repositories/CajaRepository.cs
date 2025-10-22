namespace back.Repositories;

using back.Configuration;
using back.Entities;
using back.Enums;
using MongoDB.Driver;

public class CajaRepository(MongoDbContext ctx) : ICajaRepository
{
    private readonly IMongoCollection<Caja> _col = ctx.Cajas;

    public async Task<Caja?> GetOpenAsync()
    {
        var filter = Builders<Caja>.Filter.Eq(c => c.Estado, EstadoCaja.Abierta);

        return await _col.Find(filter)
                         .SortByDescending(c => c.Apertura)
                         .FirstOrDefaultAsync();
    }

    public async Task<List<Caja>> GetHistoryAsync(int take = 50)
    {
        return await _col.Find(Builders<Caja>.Filter.Empty)
                         .SortByDescending(c => c.Apertura)
                         .Limit(take)
                         .ToListAsync();
    }

    public Task AddAsync(Caja caja) => _col.InsertOneAsync(caja);

    public async Task<bool> CloseAsync(string id, decimal montoReal, decimal montoCalculado, string? observaciones)
    {
        var filter = Builders<Caja>.Filter.Eq(c => c.Id, id) &
                     Builders<Caja>.Filter.Eq(c => c.Estado, EstadoCaja.Abierta);

        var update = Builders<Caja>.Update
            .Set(c => c.Cierre, DateTime.UtcNow)
            .Set(c => c.MontoCierreReal, montoReal)
            .Set(c => c.MontoCierreCalculado, montoCalculado)
            .Set(c => c.Observaciones, observaciones ?? string.Empty)
            .Set(c => c.Estado, EstadoCaja.Cerrada);

        var result = await _col.UpdateOneAsync(filter, update);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }
}
