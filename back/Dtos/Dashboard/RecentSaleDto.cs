namespace back.Dtos.Dashboard;

public record RecentSaleDto(
    string Producto,
    string Cantidad, // p.ej. "5 kg"
    decimal Importe,
    DateTime Fecha
);
