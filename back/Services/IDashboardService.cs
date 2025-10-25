using back.Dtos.Dashboard;

namespace back.Services;

public interface IDashboardService
{
    Task<DashboardResponseDto> GetAsync();
}
