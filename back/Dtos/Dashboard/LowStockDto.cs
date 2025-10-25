using back.Enums;

namespace back.Dtos.Dashboard;

public class LowStockDto
{
    public Categoria Categoria { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public Medida Medida { get; set; }
    public double Stock { get; set; }
    public double StockMinimo { get; set; }
}