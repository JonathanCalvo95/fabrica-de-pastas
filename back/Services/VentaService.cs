using back.Dtos.Ventas;
using back.Entities;
using back.Enums;
using back.Repositories;

namespace back.Services;

public class VentaService(
    IVentaRepository ventas,
    IProductoRepository productos,
    ICajaRepository cajaRepo
) : IVentaService
{
    public async Task<VentaDetailDto> CreateAsync(VentaCreateDto dto, string? usuarioId)
    {
        if (dto.Productos.Count == 0)
            throw new ArgumentException("Debe incluir al menos un producto.");

        // Caja abierta (para asociar si corresponde)
        var caja = await cajaRepo.GetOpenAsync(null); // caja única en tu app
        var sesionCajaId = caja?.Id;

        // Tomar precios actuales
        var ids = dto.Productos.Select(p => p.ProductoId);
        var info = await productos.GetBasicInfoAsync(ids);

        // Armar venta + descontar stock por cada ítem
        var items = new List<VentaItem>();
        foreach (var it in dto.Productos)
        {
            if (!info.TryGetValue(it.ProductoId, out var meta))
                throw new ArgumentException($"Producto {it.ProductoId} no existe.");

            if (it.Cantidad <= 0)
                throw new ArgumentException("Cantidad inválida.");

            // Descuenta stock de forma atómica si hay suficiente
            var (ok, _, precioActual, _) = await productos.DecrementStockIfEnoughAsync(it.ProductoId, it.Cantidad);
            if (!ok)
                throw new InvalidOperationException($"Stock insuficiente para {meta.Nombre}.");

            items.Add(new VentaItem
            {
                ProductoId = it.ProductoId,
                Cantidad = it.Cantidad,
                PrecioUnitario = meta.Precio // se fija aquí
            });
        }

        var total = items.Sum(i => i.Monto);

        var venta = new Venta
        {
            Fecha = DateTime.UtcNow,
            Productos = items,
            Total = total,
            MetodoPago = dto.MetodoPago,
            UsuarioId = usuarioId,
            SesionCajaId = sesionCajaId,
            Estado = EstadoVenta.Confirmada
        };

        await ventas.AddAsync(venta);

        return ToDetailDto(venta, info);
    }

    public async Task<VentaDetailDto?> GetByIdAsync(string id)
    {
        var v = await ventas.GetByIdAsync(id);
        if (v is null) return null;

        var info = await productos.GetBasicInfoAsync(v.Productos.Select(p => p.ProductoId));
        return ToDetailDto(v, info);
    }

    public async Task<List<VentaListItemDto>> GetLastAsync(int take = 50)
    {
        var list = await ventas.GetLastAsync(take);
        return list.Select(v => new VentaListItemDto
        {
            Id = v.Id,
            Fecha = v.Fecha,
            Items = v.Productos.Count,
            Total = v.Total,
            MetodoPago = v.MetodoPago,
            Estado = v.Estado
        }).ToList();
    }

    private static VentaDetailDto ToDetailDto(Venta v, Dictionary<string, (string Nombre, decimal Precio)> meta)
    {
        return new VentaDetailDto
        {
            Id = v.Id,
            Fecha = v.Fecha,
            MetodoPago = v.MetodoPago,
            SesionCajaId = v.SesionCajaId,
            Estado = v.Estado,
            Total = v.Total,
            Productos = v.Productos.Select(p => new VentaDetailItemDto
            {
                ProductoId = p.ProductoId,
                Nombre = meta.TryGetValue(p.ProductoId, out var m) ? m.Nombre : "",
                Cantidad = p.Cantidad,
                PrecioUnitario = p.PrecioUnitario,
                Monto = p.Monto
            }).ToList()
        };
    }
}
