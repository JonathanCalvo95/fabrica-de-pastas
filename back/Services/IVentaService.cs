using back.Dtos.Ventas;
using back.Entities;
using back.Enums;

namespace back.Services;

public interface IVentaService
{
    Task<VentaDetailDto> CreateAsync(VentaCreateDto dto, string? usuarioId);
    Task<VentaDetailDto?> GetByIdAsync(string id);
    Task<List<VentaListItemDto>> GetLastAsync(int take = 50);
    Task<List<Venta>> GetByDateRangeAsync(DateTime fromUtc, DateTime toUtc, EstadoVenta[]? estados = null);
    Task<VentaDetailDto> CancelAsync(string id);
}
