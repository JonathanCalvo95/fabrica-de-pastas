using back.Entities;

namespace back.Repositories;

public interface IProductoRepository
{
    Task<IEnumerable<Producto>> GetAllAsync(bool activos = true);
    Task<Producto?> GetByIdAsync(string id);
    Task AddAsync(Producto producto);
    Task<bool> UpdateAsync(string id, Producto producto);
    Task<bool> DeleteAsync(string id);
    Task<(bool ok, string? nombre, decimal precio, double stockRestante)> DecrementStockIfEnoughAsync(string productoId, double cantidad);
    Task<Dictionary<string, (string Nombre, decimal Precio)>> GetBasicInfoAsync(IEnumerable<string> ids);
}
