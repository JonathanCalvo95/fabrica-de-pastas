namespace back.Dtos.Dashboard;

public record DashboardResponseDto(
    DashboardStatsDto Stats,
    IEnumerable<RecentSaleDto> RecentSales,
    IEnumerable<LowStockDto> LowStock
);
