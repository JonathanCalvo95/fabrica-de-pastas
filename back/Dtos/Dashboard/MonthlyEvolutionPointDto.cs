namespace back.Dtos.Dashboard;

public class MonthlyEvolutionPointDto
{
    public string Label { get; set; } = "";
    public decimal Ventas { get; set; }
    public decimal PromedioDiario { get; set; }
}
