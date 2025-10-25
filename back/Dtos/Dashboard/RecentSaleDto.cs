using back.Enums;

namespace back.Dtos.Dashboard;

public class RecentSaleDto
{
    public Categoria Categoria { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public Medida Medida { get; set; }
    public double Cantidad { get; set; }
    public decimal Importe { get; set; }
    public DateTime Fecha { get; set; }
}