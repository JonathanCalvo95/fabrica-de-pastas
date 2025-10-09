using back.Entities;

namespace back.Services;

public interface IProductoService
{
    Task<IEnumerable<Producto>> GetAllAsync();
    Task<Producto?> GetByIdAsync(string id);
    Task AddAsync(Producto producto);
    Task<bool> UpdateAsync(string id, Producto producto);
    Task<bool> DeleteAsync(string id);
}
