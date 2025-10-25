namespace back.Services;

using back.Entities;

public interface ICajaService
{
    Task<Caja?> GetOpenAsync();
    Task<List<Caja>> GetHistoryAsync(int take = 50);
    Task<Caja> OpenAsync(string usuarioId, CajaRequestDto req);
    Task<bool> CloseAsync(string? usuarioId, CajaRequestDto req);
    Task<decimal> GetVentasEfectivoAsync();
}
