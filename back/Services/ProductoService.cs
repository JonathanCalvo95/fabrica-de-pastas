using back.Entities;
using back.Repositories;

namespace back.Services;

public class ProductoService(IProductoRepository repo) : IProductoService
{
    private readonly IProductoRepository _repo = repo;

    public async Task<IEnumerable<Producto>> GetAllAsync()
    {
        return await _repo.GetAllAsync();
    }

    public async Task<Producto?> GetByIdAsync(string id)
    {
        return await _repo.GetByIdAsync(id);
    }

    public async Task AddAsync(Producto producto)
    {
        if (string.IsNullOrWhiteSpace(producto.Nombre))
        {
            throw new ArgumentException("El nombre del producto es obligatorio.");
        }
        await _repo.AddAsync(producto);
    }

    public async Task<bool> UpdateAsync(string id, Producto producto)
    {
        return await _repo.UpdateAsync(id, producto);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        return await _repo.DeleteAsync(id);
    }
}
