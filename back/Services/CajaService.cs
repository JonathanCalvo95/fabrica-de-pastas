namespace back.Services;

using back.Entities;
using back.Enums;
using back.Repositories;

public class CajaService(ICajaRepository repo, IVentaRepository ventas) : ICajaService
{
    public Task<Caja?> GetOpenAsync() => repo.GetOpenAsync();

    public Task<List<Caja>> GetHistoryAsync(int take = 50) => repo.GetHistoryAsync(take);

    public async Task<Caja> OpenAsync(string usuarioId, decimal montoApertura, string? observaciones)
    {
        var abierta = await repo.GetOpenAsync();
        if (abierta is not null)
            throw new InvalidOperationException("Ya existe una caja abierta.");

        var caja = new Caja
        {
            Apertura = DateTime.UtcNow,
            MontoApertura = montoApertura,
            UsuarioId = usuarioId,
            Estado = EstadoCaja.Abierta,
            Observaciones = observaciones ?? string.Empty
        };

        await repo.AddAsync(caja);
        return caja;
    }

    public async Task<bool> CloseAsync(string? usuarioId, decimal montoCierreReal, string? observaciones)
    {
        var abierta = await repo.GetOpenAsync();
        if (abierta is null)
            throw new InvalidOperationException("No hay caja abierta para cerrar.");

        decimal ventasEfectivo = await ventas.GetTotalEfectivoDesdeAsync(abierta.Apertura);

        decimal montoCalculado = abierta.MontoApertura + ventasEfectivo;

        return await repo.CloseAsync(
            abierta.Id,
            montoCierreReal,
            montoCalculado,
            observaciones
        );
    }
}
