using back.Entities;
using back.Enums;

namespace back.Repositories;

public interface IPedidoRepository
{
    Task<string> AddAsync(Pedido p);
    Task<Pedido?> GetByIdAsync(string id);
    Task<List<Pedido>> GetAllAsync(EstadoPedido[]? estados = null);
    Task UpdateAsync(Pedido p);
    Task DeleteAsync(string id);
}
