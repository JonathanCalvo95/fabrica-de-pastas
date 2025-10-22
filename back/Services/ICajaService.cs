namespace back.Services;

using back.Entities;

public interface ICajaService
{
    Task<Caja?> GetOpenAsync();
    Task<List<Caja>> GetHistoryAsync(int take = 50);
    Task<Caja> OpenAsync(string usuarioId, decimal montoApertura, string? observaciones);
    Task<bool> CloseAsync(string? usuarioId, decimal montoCierreReal, string? observaciones);
}
