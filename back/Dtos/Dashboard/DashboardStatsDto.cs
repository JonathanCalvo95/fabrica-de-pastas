namespace back.Dtos.Dashboard;

public class DashboardStatsDto
{
    public decimal VentasDelMes { get; set; }
    public decimal? VentasDelMesChangePct { get; set; }

    public int ProductosActivos { get; set; }
    public int ProductosActivosChange { get; set; }

    public decimal StockKg { get; set; }
    public double StockUnidades { get; set; }
    public double StockLitros { get; set; }
    public double StockCajas { get; set; }

    public decimal TicketPromedio { get; set; }
    public decimal? TicketPromedioChangePct { get; set; }
}
