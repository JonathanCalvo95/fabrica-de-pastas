namespace back.Dtos.Dashboard;

public record LowStockDto(
    string Producto,
    string Actual,
    string Minimo
);
