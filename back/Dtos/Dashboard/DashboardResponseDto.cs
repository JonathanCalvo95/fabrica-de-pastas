
namespace back.Dtos.Dashboard;

public class DashboardResponseDto
{
    public DashboardStatsDto Stats { get; set; }
    public List<RecentSaleDto> RecentSales { get; set; }
    public List<LowStockDto> LowStock { get; set; }

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
