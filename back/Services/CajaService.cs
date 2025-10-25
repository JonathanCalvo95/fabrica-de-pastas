namespace back.Services;

using back.Entities;
using back.Enums;

public class CajaService(ICajaRepository repo) : ICajaService
{
    public Task<Caja?> GetOpenAsync() => repo.GetOpenAsync();

    public Task<List<Caja>> GetHistoryAsync(int take = 50) => repo.GetHistoryAsync(take);

    public async Task<Caja> OpenAsync(string usuarioId, CajaRequestDto req)
    {
        var abierta = await repo.GetOpenAsync();
        if (abierta is not null)
            throw new InvalidOperationException("Ya existe una caja abierta.");

        var caja = new Caja
        {
            Apertura = DateTime.UtcNow,
            MontoInicial = req.Monto,
            UsuarioId = usuarioId,
            Estado = EstadoCaja.Abierta,
            Observaciones = req.Observaciones ?? string.Empty
        };

        await repo.AddAsync(caja);
        return caja;
    }

    public async Task<bool> CloseAsync(string? usuarioId, CajaRequestDto req)
    {
        var abierta = await repo.GetOpenAsync();
        if (abierta is null)
            throw new InvalidOperationException("No hay caja abierta para cerrar.");

        decimal ventasEfectivo = await repo.GetTotalEfectivo();

        decimal montoCalculado = abierta.MontoInicial + ventasEfectivo;

        return await repo.CloseAsync(
            abierta.Id,
            req.Monto,
            montoCalculado,
            req.Observaciones
        );
    }

    public Task<decimal> GetVentasEfectivoAsync() => repo.GetTotalEfectivo();
}
