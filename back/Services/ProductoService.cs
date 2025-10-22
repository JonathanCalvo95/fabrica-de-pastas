using back.Entities;
using back.Repositories;

namespace back.Services;

public class ProductoService(IProductoRepository repo) : IProductoService
{
    public Task<IEnumerable<Producto>> GetAllAsync(bool activos = true)
            => repo.GetAllAsync(activos);

    public async Task<Producto?> GetByIdAsync(string id)
    {
        return await repo.GetByIdAsync(id);
    }

    public async Task AddAsync(Producto producto)
    {
        if (string.IsNullOrWhiteSpace(producto.Nombre))
        {
            throw new ArgumentException("El nombre del producto es obligatorio.");
        }
        await repo.AddAsync(producto);
    }

    public async Task<bool> UpdateAsync(string id, Producto producto)
    {
        return await repo.UpdateAsync(id, producto);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        return await repo.DeleteAsync(id);
    }

}
