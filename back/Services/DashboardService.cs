using back.Domain;
using back.Dtos.Dashboard;
using back.Entities;
using back.Enums;
using System.ComponentModel;
using System.Globalization;

namespace back.Services;

public class DashboardService(
    IProductoService productoService,
    IVentaService ventaService,
    ICajaService cajaService) : IDashboardService
{
    public async Task<DashboardResponseDto> GetAsync()
    {
        var now = DateTime.UtcNow;
        var startThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startPrevMonth = startThisMonth.AddMonths(-1);
        var endPrevMonth = startThisMonth.AddTicks(-1);

        // ===== Productos y stock =====
        var productos = (await productoService.GetAllAsync(activos: true)).ToList();
        int productosActivos = productos.Count;
        int productosCreadosEsteMes = productos.Count(p => p.FechaCreacion >= startThisMonth);

        // stock agrupado por medida
        decimal stockKg = (decimal)productos.Where(p => p.Categoria.Defaults().medida == Medida.Kg).Sum(p => p.Stock);
        double stockUnidades = productos.Where(p => p.Categoria.Defaults().medida == Medida.Unidad).Sum(p => p.Stock);
        double stockLitros = productos.Where(p => p.Categoria.Defaults().medida == Medida.Litro).Sum(p => p.Stock);
        double stockCajas = productos.Where(p => p.Categoria.Defaults().medida == Medida.Caja).Sum(p => p.Stock);

        // ===== Ventas del mes actual y anterior =====
        var ventasMesActual = await ventaService.GetByDateRangeAsync(startThisMonth, now);
        var ventasMesAnterior = await ventaService.GetByDateRangeAsync(startPrevMonth, endPrevMonth);

        decimal TotalVentas(IEnumerable<Venta> ventas) =>
            ventas.Sum(v => v.Items.Sum(it => it.PrecioUnitario * (decimal)it.Cantidad));

        var ventasDelMes = Math.Round(TotalVentas(ventasMesActual), 2);
        var ventasMesAnt = Math.Round(TotalVentas(ventasMesAnterior), 2);

        decimal? ventasChangePct = ventasMesAnt == 0
            ? null
            : Math.Round(((ventasDelMes - ventasMesAnt) / ventasMesAnt) * 100m, 1);

        // ===== Stock bajo =====
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

        // ===== Ventas recientes (items) =====
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

        // ===== Ticket promedio =====
        int ordenesMesActual = ventasMesActual.Count;
        int ordenesMesAnterior = ventasMesAnterior.Count;
        decimal ticketPromActual = ordenesMesActual == 0 ? 0m : Math.Round(ventasDelMes / ordenesMesActual, 2);
        decimal ticketPromAnterior = ordenesMesAnterior == 0 ? 0m : Math.Round(ventasMesAnt / ordenesMesAnterior, 2);

        decimal? ticketChangePct = ordenesMesAnterior == 0 || ticketPromAnterior == 0m
            ? (decimal?)null
            : Math.Round(((ticketPromActual - ticketPromAnterior) / ticketPromAnterior) * 100m, 1);

        // ===== Monthly Evolution (últimos 6 meses) =====
        var monthlyEvolution = new List<MonthlyEvolutionPointDto>();
        for (int i = 5; i >= 0; i--)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-i);
            var monthEnd = monthStart.AddMonths(1).AddTicks(-1);
            var ventasMes = await ventaService.GetByDateRangeAsync(monthStart, monthEnd);
            var totalMes = Math.Round(TotalVentas(ventasMes), 2);
            var diasMes = DateTime.DaysInMonth(monthStart.Year, monthStart.Month);
            monthlyEvolution.Add(new MonthlyEvolutionPointDto
            {
                Label = monthStart.ToString("MMM", new CultureInfo("es-AR")),
                Ventas = totalMes,
                PromedioDiario = diasMes == 0 ? 0 : Math.Round(totalMes / diasMes, 2)
            });
        }

    // ===== Ventas por día de la semana (últimos 7 días) =====
    var start7 = now.AddDays(-7);
    var ventas7 = await ventaService.GetByDateRangeAsync(start7, now);

        var weekdayTotals = Enumerable.Range(0, 7).Select(_ => 0m).ToArray(); // 0=Sunday
    foreach (var v in ventas7)
        {
            var importeVenta = ImporteVenta(v);
            var dow = (int)v.Fecha.DayOfWeek;
            weekdayTotals[dow] += importeVenta;
        }

        // Orden LUN..DOM => 1..6,0
        var dayOrder = new[] { 1, 2, 3, 4, 5, 6, 0 };
        var dayNames = new[] { "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb" };
        var salesByWeekday = dayOrder.Select(i => new SalesByWeekdayDto
        {
            Label = dayNames[i],
            Ventas = Math.Round(weekdayTotals[i], 2)
        }).ToList();

        // ===== Métodos de pago (agrupado, usando enum MetodoPago) =====
    var payments = ventas7
            .GroupBy(v => v.MetodoPago) // si fuera nullable: GroupBy(v => v.MetodoPago)
            .Select(g => new
            {
                Metodo = g.Key,         // MetodoPago
                Importe = g.Sum(ImporteVenta)
            })
            .OrderByDescending(x => x.Importe)
            .ToList();

        var paymentMethods = payments.Select(x => new PaymentMethodDto
        {
            Metodo = GetEnumDescription(x.Metodo), // “Efectivo”, “Mercado Pago”, “Transferencia”
            Importe = Math.Round(x.Importe, 2)
        }).ToList();

        var productoIngresos = new Dictionary<string, (string CategoriaDesc, string Descripcion, decimal Cantidad, decimal Ingresos)>();
        foreach (var v in ventasMesActual)
        {
            foreach (var it in v.Items)
            {
                var prodMeta = productos.FirstOrDefault(p => p.Id == it.ProductoId);
                if (prodMeta == null) continue;
                var key = prodMeta.Id;
                var ingresoItem = it.PrecioUnitario * (decimal)it.Cantidad;
                if (!productoIngresos.ContainsKey(key))
                    productoIngresos[key] = (prodMeta.Categoria.ToString(), prodMeta.Descripcion, (decimal)it.Cantidad, ingresoItem);
                else
                {
                    var curr = productoIngresos[key];
                    productoIngresos[key] = (curr.CategoriaDesc, curr.Descripcion, curr.Cantidad + (decimal)it.Cantidad, curr.Ingresos + ingresoItem);
                }
            }
        }

        var topProducts = productoIngresos
            .Select(kv => new TopProductDto
            {
                Categoria = kv.Value.CategoriaDesc,
                Descripcion = kv.Value.Descripcion,
                Cantidad = kv.Value.Cantidad,
                Ingresos = Math.Round(kv.Value.Ingresos, 2),
                MargenPct = null // Placeholder si luego se calcula margen.
            })
            .OrderByDescending(p => p.Ingresos)
            .Take(5)
            .ToList();

        // ===== Historial de cierres de caja (últimas 10 cajas) =====
        var cajasHist = await cajaService.GetHistoryAsync(10);
        var cashClosures = cajasHist.Select(c =>
        {
            var cierreMonto = c.MontoReal ?? c.MontoCalculado ?? c.MontoInicial;
            var diferencia = (c.MontoReal.HasValue && c.MontoCalculado.HasValue)
                ? c.MontoReal.Value - c.MontoCalculado.Value
                : 0m;
            var status = c.Estado == EstadoCaja.Cerrada && Math.Abs(diferencia) < 0.01m ? "ok" : "diff";
            return new CashClosureDto
            {
                Fecha = c.Cierre ?? c.Apertura,
                Apertura = c.MontoInicial,
                Cierre = cierreMonto,
                Diferencia = Math.Round(diferencia, 2),
                Estado = status
            };
        }).ToList();

        // ===== Stats + Response =====
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

        var response = new DashboardResponseDto(stats, recent, lowStock)
        {
            MonthlyEvolution = monthlyEvolution,
            SalesByWeekday = salesByWeekday,
            PaymentMethods = paymentMethods,
            TopProducts = topProducts,
            CashClosures = cashClosures
        };

        return response;
    }

    // ===== Helpers =====
    private static decimal ImporteVenta(Venta v) =>
        v.Items.Sum(it => it.PrecioUnitario * (decimal)it.Cantidad);

    private static string GetEnumDescription(Enum value)
    {
        var fi = value.GetType().GetField(value.ToString());
        if (fi == null) return value.ToString();

        var attr = (DescriptionAttribute?)
            Attribute.GetCustomAttribute(fi, typeof(DescriptionAttribute));

        return attr?.Description ?? value.ToString();
    }
}
