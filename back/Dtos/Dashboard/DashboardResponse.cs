namespace back.Dtos.Dashboard;

public record DashboardResponse(
    DashboardStatsDto           Stats,
    IEnumerable<RecentSaleDto>  RecentSales,
    IEnumerable<LowStockDto>    LowStock
);
