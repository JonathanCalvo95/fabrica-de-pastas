using back.Dtos.Pedidos;
using back.Dtos.Ventas;
using back.Entities;
using back.Enums;
using back.Repositories;
using back.Domain;

namespace back.Services;

public class PedidoService(
    IPedidoRepository repo,
    IProductoRepository productosRepo,
    IVentaService ventaService
) : IPedidoService
{
    public async Task<PedidoDetailDto> CreateAsync(PedidoCreateDto dto, string? usuarioId)
    {
        if (dto is null) throw new ArgumentNullException(nameof(dto));
        if (dto.Items is null || dto.Items.Count == 0)
            throw new ArgumentException("Debe incluir al menos un producto.");

        var groupedItems = dto.Items
            .GroupBy(i => i.ProductoId)
            .Select(g => new PedidoItem { ProductoId = g.Key, Cantidad = g.Sum(x => x.Cantidad) })
            .ToList();

        var p = new Pedido
        {
            Fecha = DateTime.UtcNow,
            Cliente = dto.Cliente,
            Observaciones = dto.Observaciones,
            Estado = EstadoPedido.Pendiente,
            Items = groupedItems,
            UsuarioId = usuarioId
        };

        await repo.AddAsync(p);
        return await ToDetailDtoAsync(p);
    }

    public async Task<PedidoDetailDto?> GetByIdAsync(string id)
    {
        var p = await repo.GetByIdAsync(id);
        if (p is null) return null;
        return await ToDetailDtoAsync(p);
    }

    public async Task<List<PedidoListItemDto>> GetAllAsync(EstadoPedido[]? estados = null)
    {
        var list = await repo.GetAllAsync(estados);
        var productoIds = list.SelectMany(x => x.Items.Select(i => i.ProductoId)).Distinct().ToArray();
        var productos = await productosRepo.GetInfoAsync(productoIds);

        return list.Select(p => new PedidoListItemDto
        {
            Id = p.Id,
            Fecha = p.Fecha,
            Cliente = p.Cliente,
            Estado = p.Estado,
            Total = p.Items.Sum(i =>
            {
                var prod = productos.FirstOrDefault(x => x.Id == i.ProductoId);
                var precio = prod?.Precio ?? 0m;
                return precio * (decimal)i.Cantidad;
            }),
            UsuarioId = p.UsuarioId,
            VentaId = p.VentaId
        }).ToList();
    }

    public async Task<PedidoDetailDto?> UpdateEstadoAsync(string id, EstadoPedido estado)
    {
        var p = await repo.GetByIdAsync(id);
        if (p is null) return null;
        
        // Solo se puede pasar a Entregado si tiene venta generada
        if (estado == EstadoPedido.Entregado && string.IsNullOrEmpty(p.VentaId))
        {
            throw new InvalidOperationException("No se puede marcar como Entregado un pedido sin venta generada");
        }
        
        p.Estado = estado;
        await repo.UpdateAsync(p);
        return await ToDetailDtoAsync(p);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var p = await repo.GetByIdAsync(id);
        if (p is null) return false;
        await repo.DeleteAsync(id);
        return true;
    }

    public async Task<(string ventaId, string pedidoId)> GenerarVentaDesdePedidoAsync(string id, GenerarVentaDesdePedidoDto dto, string? usuarioId)
    {
        var p = await repo.GetByIdAsync(id) ?? throw new ArgumentException("Pedido no encontrado");
        if (p.Estado == EstadoPedido.Cancelado)
            throw new InvalidOperationException("No se puede generar venta desde un pedido cancelado.");

        var ventaDto = new VentaCreateDto
        {
            Items = p.Items.Select(i => new VentaCreateItemDto
            {
                ProductoId = i.ProductoId,
                Cantidad = i.Cantidad
            }).ToList(),
            MetodoPago = dto.MetodoPago,
            Observaciones = string.IsNullOrWhiteSpace(p.Observaciones)
                ? $"Desde pedido {p.Id}"
                : $"Desde pedido {p.Id} | Obs: {p.Observaciones}"
        };

        var venta = await ventaService.CreateAsync(ventaDto, usuarioId);

        p.VentaId = venta.Id;
        p.Estado = EstadoPedido.Entregado;
        await repo.UpdateAsync(p);

        return (venta.Id, p.Id);
    }

    private async Task<PedidoDetailDto> ToDetailDtoAsync(Pedido p)
    {
        var productoIds = p.Items.Select(i => i.ProductoId).Distinct().ToArray();
        var productos = await productosRepo.GetInfoAsync(productoIds);
        var items = p.Items.Select(i =>
        {
            var prod = productos.First(x => x.Id == i.ProductoId);
            var (medida, _, _) = prod.Categoria.Defaults();
            var precio = prod.Precio;
            return new PedidoItemDto
            {
                ProductoId = i.ProductoId,
                Categoria = prod.Categoria,
                Medida = medida,
                Descripcion = prod.Descripcion,
                Cantidad = i.Cantidad,
                PrecioUnitario = precio,
                Subtotal = precio * (decimal)i.Cantidad
            };
        }).ToList();

        return new PedidoDetailDto
        {
            Id = p.Id,
            Fecha = p.Fecha,
            Cliente = p.Cliente,
            Observaciones = p.Observaciones,
            Estado = p.Estado,
            VentaId = p.VentaId,
            UsuarioId = p.UsuarioId,
            Items = items,
            Total = items.Sum(x => x.Subtotal)
        };
    }
}
