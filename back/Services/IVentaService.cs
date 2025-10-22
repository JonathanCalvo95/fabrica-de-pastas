using back.Dtos.Ventas;

namespace back.Services;

public interface IVentaService
{
    Task<VentaDetailDto> CreateAsync(VentaCreateDto dto, string? usuarioId);
    Task<VentaDetailDto?> GetByIdAsync(string id);
    Task<List<VentaListItemDto>> GetLastAsync(int take = 50);
}
