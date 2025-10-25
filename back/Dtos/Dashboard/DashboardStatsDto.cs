namespace back.Dtos.Dashboard;

public record DashboardStatsDto(
    decimal VentasDelMes,
    int ProductosActivos,
    decimal StockKg,
    double StockUnidades,
    double StockLitros,
    double StockCajas,
    decimal GananciaNeta
);
