namespace back.Dtos.Dashboard;

public record RecentSaleDto(
    string Producto,
    string Cantidad,
    decimal Importe,
    DateTime Fecha
);
