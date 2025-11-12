namespace back.Dtos.Dashboard;

public class TopProductDto
{
    public string Categoria { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public decimal Cantidad { get; set; }
    public decimal Ingresos { get; set; }
    public decimal? MargenPct { get; set; }
}
