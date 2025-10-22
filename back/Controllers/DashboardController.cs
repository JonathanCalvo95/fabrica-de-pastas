using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using back.Dtos.Dashboard;
using back.Enums;
using back.Services;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(IProductoService productoService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardResponseDto>> Get()
    {
        var productos = (await productoService.GetAllAsync()).ToList();

        int productosActivos = productos.Count(p => p.Activo);
        decimal stockKg = productos.Where(p => p.Medida == Medida.Kg)
                                            .Sum(p => (decimal)p.Stock);
        double stockUnidades = productos.Where(p => p.Medida == Medida.Unidad)
                                            .Sum(p => p.Stock);
        double stockLitros = productos.Where(p => p.Medida == Medida.Litro)
                                            .Sum(p => p.Stock);

        decimal ventasDelMes = 0m;
        decimal gananciaNeta = 0m;

        const double STOCK_MIN_DEF = 10;
        var lowStock = productos
            .Where(p => p.Activo && p.Stock < STOCK_MIN_DEF)
            .Select(p => new LowStockDto(
                Producto: p.Nombre,
                Actual: FormatearCantidad(p.Stock, p.Medida),
                Minimo: FormatearCantidad(STOCK_MIN_DEF, p.Medida)
            ))
            .ToList();

        var stats = new DashboardStatsDto(
            VentasDelMes: ventasDelMes,
            ProductosActivos: productosActivos,
            StockKg: stockKg,
            StockUnidades: stockUnidades,
            StockLitros: stockLitros,
            GananciaNeta: gananciaNeta
        );

        var recent = new List<RecentSaleDto>();

        return Ok(new DashboardResponseDto(stats, recent, lowStock));
    }

    private static string FormatearCantidad(double cant, Medida um) =>
        um switch
        {
            Medida.Kg => $"{cant:0.##} kg",
            Medida.Unidad => $"{cant:0} u",
            Medida.Litro => $"{cant:0.##} l",
            _ => cant.ToString("0.##")
        };
}
