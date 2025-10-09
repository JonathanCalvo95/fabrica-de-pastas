using back.Entities;

namespace back.Repositories;

public interface IProductoRepository
{
    Task<IEnumerable<Producto>> GetAllAsync();
    Task<Producto?> GetByIdAsync(string id);
    Task AddAsync(Producto producto);
    Task<bool> UpdateAsync(string id, Producto producto);
    Task<bool> DeleteAsync(string id);
}
