using back.Entities;
using back.Enums;

namespace back.Repositories;

public interface IVentaRepository
{
    Task AddAsync(Venta v);
    Task<Venta?> GetByIdAsync(string id);
    Task<List<Venta>> GetLastAsync(int take = 50);
    Task<List<Venta>> GetByDateRangeAsync(DateTime fromUtc, DateTime toUtc, EstadoVenta[]? estados = null);
    Task UpdateEstadoAsync(string id, EstadoVenta estado);
}
