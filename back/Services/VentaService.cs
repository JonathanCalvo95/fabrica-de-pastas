using back.Dtos.Ventas;
using back.Entities;
using back.Enums;
using back.Repositories;
using back.Domain;

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

        // Normalizar/validar: no permitir productos repetidos; agrupar y sumar cantidades
        var groupedItems = dto.Items
            .GroupBy(i => i.ProductoId)
            .Select(g => new VentaCreateItemDto { ProductoId = g.Key, Cantidad = g.Sum(x => x.Cantidad) })
            .ToList();

        // Info básica de productos
        var productoIds = groupedItems.Select(p => p.ProductoId).ToArray();
        var productos = await productosRepo.GetInfoAsync(productoIds);

        var items = new List<VentaItem>();

        foreach (var it in groupedItems)
        {
            if (!productos.ToDictionary(p => p.Id).TryGetValue(it.ProductoId, out var prod))
                throw new ArgumentException($"Producto {it.ProductoId} no existe.");

            if (it.Cantidad <= 0)
                throw new ArgumentException("Cantidad inválida.");

            // Validar cantidades enteras para medidas Unidad / Caja
            var (medida, _, _) = prod.Categoria.Defaults();
            if ((medida == Medida.Unidad || medida == Medida.Caja) && Math.Abs(it.Cantidad - Math.Round(it.Cantidad)) > 1e-6)
                throw new ArgumentException("Cantidad debe ser un número entero para productos de medida Unidad o Caja.");

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
            Estado = EstadoVenta.Realizada
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
            Estado = v.Estado,
            CajaId = v.CajaId
        }).ToList();
    }

    public async Task<List<VentaListItemDto>> GetByCajaIdAsync(string cajaId)
    {
        if (string.IsNullOrWhiteSpace(cajaId))
            throw new ArgumentException("CajaId inválido", nameof(cajaId));

        var list = await ventasRepo.GetByCajaIdAsync(cajaId);

        return list.Select(v => new VentaListItemDto
        {
            Id = v.Id,
            Fecha = v.Fecha,
            Items = v.Items,
            Total = v.Total,
            MetodoPago = v.MetodoPago,
            Estado = v.Estado,
            CajaId = v.CajaId
        }).ToList();
    }

    public async Task<List<Venta>> GetByDateRangeAsync(DateTime fromUtc, DateTime toUtc, EstadoVenta[]? estados = null)
    {
        estados ??= [EstadoVenta.Realizada, EstadoVenta.Anulada];
        return await ventasRepo.GetByDateRangeAsync(fromUtc, toUtc, estados);
    }

    public async Task<VentaDetailDto> CancelAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Id inválido", nameof(id));

        var v = await ventasRepo.GetByIdAsync(id) ?? throw new ArgumentException("Venta no encontrada");
        if (v.Estado == EstadoVenta.Anulada)
            return await GetByIdAsync(id) ?? throw new InvalidOperationException("Estado no disponible");

        // Solo permitir anular ventas realizadas
        if (v.Estado != EstadoVenta.Realizada)
            throw new InvalidOperationException("La venta no puede ser anulada en su estado actual.");

        // Reponer stock por cada item
        foreach (var it in v.Items)
        {
            await productosRepo.IncrementStockAsync(it.ProductoId, it.Cantidad);
        }

        await ventasRepo.UpdateEstadoAsync(id, EstadoVenta.Anulada);

        var productos = await productosRepo.GetInfoAsync(v.Items.Select(i => i.ProductoId).ToArray());
        var updated = await ventasRepo.GetByIdAsync(id) ?? v;
        return ToDetailDto(updated, productos);
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
                    Medida = prod.Categoria.Defaults().medida,
                    Descripcion = prod.Descripcion,
                    Cantidad = p.Cantidad,
                    PrecioUnitario = p.PrecioUnitario,
                    Monto = p.PrecioUnitario * (decimal)p.Cantidad
                };
            }).ToList()
        };
    }
}
