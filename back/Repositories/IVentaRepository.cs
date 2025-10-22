using back.Entities;

namespace back.Repositories;

public interface IVentaRepository
{
    Task AddAsync(Venta v);
    Task<Venta?> GetByIdAsync(string id);
    Task<List<Venta>> GetLastAsync(int take = 50);
    Task<decimal> GetTotalEfectivoDesdeAsync(DateTime desdeUtc);
}
