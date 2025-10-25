using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using back.Dtos.Dashboard;
using back.Enums;
using back.Services;
using back.Domain;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(IProductoService productoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<DashboardResponseDto>> Get()
    {
        var productos = (await productoService.GetAllAsync(activos: true)).ToList();

        int productosActivos = productos.Count;

        double stockKg = productos
            .Where(p => p.Categoria.Defaults().medida == Medida.Kg)
            .Sum(p => p.Stock);

        double stockUnidades = productos
            .Where(p => p.Categoria.Defaults().medida == Medida.Unidad)
            .Sum(p => p.Stock);

        double stockLitros = productos
            .Where(p => p.Categoria.Defaults().medida == Medida.Litro)
            .Sum(p => p.Stock);

        double stockCajas = productos
            .Where(p => p.Categoria.Defaults().medida == Medida.Caja)
            .Sum(p => p.Stock);

        decimal ventasDelMes = 0m;
        decimal gananciaNeta = 0m;

        var lowStock = productos
            .Select(p =>
            {
                var (medida, min, _) = p.Categoria.Defaults();
                return new { p.Categoria, p.Descripcion, p.Stock, Medida = medida, Min = min };
            })
            .Where(x => x.Stock < x.Min)
            .Select(x => new LowStockDto(
                Producto: x.Categoria + ": " + x.Descripcion,
                Actual: FormatearCantidad(x.Stock, x.Medida),
                Minimo: FormatearCantidad(x.Min, x.Medida)
            ))
            .ToList();

        var stats = new DashboardStatsDto(
            VentasDelMes: ventasDelMes,
            ProductosActivos: productosActivos,
            StockKg: (decimal)stockKg,
            StockUnidades: stockUnidades,
            StockLitros: stockLitros,
            StockCajas: stockCajas,
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
            Medida.Caja => $"{cant:0} {(Math.Abs(cant) == 1 ? "Caja" : "Cajas")}",
            _ => cant.ToString("0.##")
        };
}
