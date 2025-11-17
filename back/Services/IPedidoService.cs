using back.Dtos.Pedidos;
using back.Enums;

namespace back.Services;

public interface IPedidoService
{
    Task<PedidoDetailDto> CreateAsync(PedidoCreateDto dto, string? usuarioId);
    Task<PedidoDetailDto?> GetByIdAsync(string id);
    Task<List<PedidoListItemDto>> GetAllAsync(EstadoPedido[]? estados = null);
    Task<PedidoDetailDto?> UpdateEstadoAsync(string id, EstadoPedido estado);
    Task<bool> DeleteAsync(string id);
    Task<(string ventaId, string pedidoId)> GenerarVentaDesdePedidoAsync(string id, GenerarVentaDesdePedidoDto dto, string? usuarioId);
}
