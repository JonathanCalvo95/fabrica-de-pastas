namespace back.Dtos.Dashboard;

public class CashClosureDto
{
    public DateTime Fecha { get; set; }
    public decimal Apertura { get; set; }
    public decimal Cierre { get; set; }
    public decimal Diferencia { get; set; }
    public string Estado { get; set; } = "";
}
