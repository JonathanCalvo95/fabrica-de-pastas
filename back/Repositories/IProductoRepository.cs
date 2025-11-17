using back.Entities;

namespace back.Repositories;

public interface IProductoRepository
{
    Task<IEnumerable<Producto>> GetAllAsync(bool activos = true);
    Task<Producto?> GetByIdAsync(string id);
    Task AddAsync(Producto producto);
    Task<bool> UpdateAsync(string id, Producto producto);
    Task<bool> DeleteAsync(string id);
    Task<(bool ok, string? descripcion, decimal precio, double stockRestante)> DecrementStockIfEnoughAsync(string productoId, double cantidad);
    Task<IEnumerable<Producto>> GetInfoAsync(IEnumerable<string> ids);
    Task IncrementStockAsync(string productoId, double cantidad);
}
