using back.Dtos.Ventas;
using back.Entities;
using back.Enums;
using back.Repositories;

namespace back.Services;

public class VentaService(
    IVentaRepository ventasRepo,
    IProductoRepository productosRepo,
    ICajaRepository cajaRepo
) : IVentaService
{
    public async Task<VentaDetailDto> CreateAsync(VentaCreateDto dto, string? usuarioId)
    {
        if (dto is null)
            throw new ArgumentNullException(nameof(dto));

        if (dto.Items is null || dto.Items.Count == 0)
            throw new ArgumentException("Debe incluir al menos un producto.");

        // Caja abierta (si la hay, se asocia)
        var caja = await cajaRepo.GetOpenAsync();
        var cajaId = caja?.Id;

        // Info básica de productos
        var productoIds = dto.Items.Select(p => p.ProductoId).ToArray();
        var productos = await productosRepo.GetInfoAsync(productoIds);

        var items = new List<VentaItem>();

        foreach (var it in dto.Items)
        {
            if (!productos.ToDictionary(p => p.Id).TryGetValue(it.ProductoId, out var prod))
                throw new ArgumentException($"Producto {it.ProductoId} no existe.");

            if (it.Cantidad <= 0)
                throw new ArgumentException("Cantidad inválida.");

            // Descuenta stock y obtiene precio vigente
            var r = await productosRepo.DecrementStockIfEnoughAsync(it.ProductoId, it.Cantidad);
            if (!r.ok)
                throw new InvalidOperationException("Stock insuficiente.");

            items.Add(new VentaItem
            {
                ProductoId = it.ProductoId,
                Cantidad = it.Cantidad,
                PrecioUnitario = r.precio
            });
        }

        var total = items.Sum(i => i.PrecioUnitario * (decimal)i.Cantidad);

        var venta = new Venta
        {
            Fecha = DateTime.UtcNow,
            Items = items,
            Total = total,
            MetodoPago = dto.MetodoPago,
            UsuarioId = usuarioId,
            CajaId = cajaId,
            Estado = EstadoVenta.Confirmada
        };

        await ventasRepo.AddAsync(venta);

        return ToDetailDto(venta, productos);
    }

    public async Task<VentaDetailDto?> GetByIdAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) return null;

        var v = await ventasRepo.GetByIdAsync(id);
        if (v is null) return null;

        var productos = await productosRepo.GetInfoAsync(v.Items.Select(p => p.ProductoId).ToArray());
        return ToDetailDto(v, productos);
    }

    public async Task<List<VentaListItemDto>> GetLastAsync(int take = 50)
    {
        if (take <= 0) take = 50;

        var list = await ventasRepo.GetLastAsync(take);

        return list.Select(v => new VentaListItemDto
        {
            Id = v.Id,
            Fecha = v.Fecha,
            Items = v.Items,
            Total = v.Total,
            MetodoPago = v.MetodoPago,
            Estado = v.Estado
        }).ToList();
    }

    public async Task<List<Venta>> GetByDateRangeAsync(DateTime fromUtc, DateTime toUtc, EstadoVenta[]? estados = null)
    {
        estados ??= [EstadoVenta.Confirmada, EstadoVenta.Anulada, EstadoVenta.Devuelta];
        return await ventasRepo.GetByDateRangeAsync(fromUtc, toUtc, estados);
    }

    private static VentaDetailDto ToDetailDto(
        Venta v,
        IEnumerable<Producto> productos)
    {
        return new VentaDetailDto
        {
            Id = v.Id,
            Fecha = v.Fecha,
            MetodoPago = v.MetodoPago,
            CajaId = v.CajaId ?? string.Empty,
            Estado = v.Estado,
            Total = v.Total,
            Items = v.Items.Select(p =>
            {
                var prod = productos.First(x => x.Id == p.ProductoId);
                return new VentaItemDto
                {
                    ProductoId = p.ProductoId,
                    Categoria = prod.Categoria,
                    Descripcion = prod.Descripcion,
                    Cantidad = p.Cantidad,
                    PrecioUnitario = p.PrecioUnitario,
                    Monto = p.PrecioUnitario * (decimal)p.Cantidad
                };
            }).ToList()
        };
    }
}
