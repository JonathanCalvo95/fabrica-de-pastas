using back.Entities;

namespace back.Services;

public interface IProductoService
{
    Task<IEnumerable<Producto>> GetAllAsync(bool activos = true);
    Task<Producto?> GetByIdAsync(string id);
    Task<IEnumerable<Producto>> GetInfoAsync(IEnumerable<string> ids);
    Task AddAsync(Producto producto);
    Task<bool> UpdateAsync(string id, Producto producto);
    Task<bool> DeleteAsync(string id);
}
