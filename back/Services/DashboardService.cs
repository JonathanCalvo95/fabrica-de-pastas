using back.Domain;
using back.Dtos.Dashboard;
using back.Entities;
using back.Enums;
using MongoDB.Driver;

namespace back.Services;

public class DashboardService(
    IProductoService productoService,
    IVentaService ventaService) : IDashboardService
{
    public async Task<DashboardResponseDto> GetAsync()
    {
        var now = DateTime.UtcNow;
        var startThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startPrevMonth = startThisMonth.AddMonths(-1);
        var endPrevMonth = startThisMonth.AddTicks(-1);

        // productos y stock
        var productos = (await productoService.GetAllAsync(activos: true)).ToList();
        int productosActivos = productos.Count;
        int productosCreadosEsteMes = productos.Count(p => p.FechaCreacion >= startThisMonth);

        // stock agrupado por medida
        decimal stockKg = (decimal)productos.Where(p => p.Categoria.Defaults().medida == Medida.Kg).Sum(p => p.Stock);
        double stockUnidades = productos.Where(p => p.Categoria.Defaults().medida == Medida.Unidad).Sum(p => p.Stock);
        double stockLitros = productos.Where(p => p.Categoria.Defaults().medida == Medida.Litro).Sum(p => p.Stock);
        double stockCajas = productos.Where(p => p.Categoria.Defaults().medida == Medida.Caja).Sum(p => p.Stock);

        // ventas del mes actual y anterior
        var ventasMesActual = await ventaService.GetByDateRangeAsync(startThisMonth, now);
        var ventasMesAnterior = await ventaService.GetByDateRangeAsync(startPrevMonth, endPrevMonth);

        decimal TotalVentas(IEnumerable<Venta> ventas) =>
            ventas.Sum(v => v.Items.Sum(it => it.PrecioUnitario * (decimal)it.Cantidad));

        var ventasDelMes = Math.Round(TotalVentas(ventasMesActual), 2);
        var ventasMesAnt = Math.Round(TotalVentas(ventasMesAnterior), 2);

        decimal? ventasChangePct = ventasMesAnt == 0
            ? null
            : Math.Round(((ventasDelMes - ventasMesAnt) / ventasMesAnt) * 100m, 1);

        // stock bajo
        var lowStock = productos
            .Select(p =>
            {
                var (medida, min, _) = p.Categoria.Defaults();
                return new { p.Categoria, p.Descripcion, p.Stock, Medida = medida, Min = min };
            })
            .Where(x => x.Stock < x.Min)
            .Select(x => new LowStockDto
            {
                Categoria = x.Categoria,
                Descripcion = x.Descripcion,
                Medida = x.Medida,
                Stock = x.Stock,
                StockMinimo = x.Min
            })
            .ToList();

        // ventas recientes
        var ultimas = await ventaService.GetLastAsync(10);
        var items = ultimas
            .OrderByDescending(v => v.Fecha)
            .SelectMany(v => v.Items?.Select(it => new { VentaFecha = v.Fecha, Item = it }) ?? [])
            .OrderByDescending(x => x.VentaFecha)
            .Take(10)
            .ToList();

        var ids2 = items.Select(x => x.Item.ProductoId).Distinct().ToArray();
        var meta2 = await productoService.GetInfoAsync(ids2);

        var recent = items.Select(x =>
        {
            var prod = meta2.First(p => p.Id == x.Item.ProductoId);
            var medida = prod.Categoria.Defaults().medida;

            return new RecentSaleDto
            {
                Categoria = prod.Categoria,
                Descripcion = prod.Descripcion,
                Medida = medida,
                Cantidad = x.Item.Cantidad,
                Importe = Math.Round(x.Item.PrecioUnitario * (decimal)x.Item.Cantidad, 2),
                Fecha = x.VentaFecha
            };
        }).ToList();

        // ticket promedio
        int ordenesMesActual = ventasMesActual.Count;
        int ordenesMesAnterior = ventasMesAnterior.Count;
        decimal ticketPromActual = ordenesMesActual == 0 ? 0m : Math.Round(ventasDelMes / ordenesMesActual, 2);
        decimal ticketPromAnterior = ordenesMesAnterior == 0 ? 0m : Math.Round(ventasMesAnt / ordenesMesAnterior, 2);

        decimal? ticketChangePct = ordenesMesAnterior == 0 || ticketPromAnterior == 0m
            ? (decimal?)null
            : Math.Round(((ticketPromActual - ticketPromAnterior) / ticketPromAnterior) * 100m, 1);

        var stats = new DashboardStatsDto
        {
            VentasDelMes = ventasDelMes,
            VentasDelMesChangePct = ventasChangePct,
            ProductosActivos = productosActivos,
            ProductosActivosChange = productosCreadosEsteMes,
            StockKg = stockKg,
            StockUnidades = stockUnidades,
            StockLitros = stockLitros,
            StockCajas = stockCajas,
            TicketPromedio = ticketPromActual,
            TicketPromedioChangePct = ticketChangePct
        };

        return new DashboardResponseDto(stats, recent, lowStock);
    }
}
