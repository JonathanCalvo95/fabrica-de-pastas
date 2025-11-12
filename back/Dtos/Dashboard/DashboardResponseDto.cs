namespace back.Dtos.Dashboard;

public class DashboardResponseDto
{
    public DashboardStatsDto Stats { get; set; }
    public List<RecentSaleDto> RecentSales { get; set; }
    public List<LowStockDto> LowStock { get; set; }

    // Nuevas propiedades
    public List<MonthlyEvolutionPointDto> MonthlyEvolution { get; set; } = [];
    public List<SalesByWeekdayDto> SalesByWeekday { get; set; } = [];
    public List<PaymentMethodDto> PaymentMethods { get; set; } = [];
    public List<TopProductDto> TopProducts { get; set; } = [];
    public List<CashClosureDto> CashClosures { get; set; } = [];

    public DashboardResponseDto(
        DashboardStatsDto stats,
        List<RecentSaleDto> recentSales,
        List<LowStockDto> lowStock)
    {
        Stats = stats;
        RecentSales = recentSales;
        LowStock = lowStock;
    }
}
