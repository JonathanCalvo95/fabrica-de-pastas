namespace back.Dtos.Dashboard;

public record LowStockDto(
    string Producto,
    string Actual,  // p.ej. "8 kg"
    string Minimo   // p.ej. "10 kg"
);
