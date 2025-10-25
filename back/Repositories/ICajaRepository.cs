using back.Entities;

public interface ICajaRepository
{
    Task<Caja?> GetOpenAsync();
    Task<List<Caja>> GetHistoryAsync(int take = 50);
    Task AddAsync(Caja sesion);
    Task<bool> CloseAsync(string id, decimal montoReal, decimal montoCalculado, string? observaciones);
    Task<decimal> GetTotalEfectivo();
}
