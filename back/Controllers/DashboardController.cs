using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using back.Dtos.Dashboard;
using back.Services;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(IDashboardService dashboardService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<DashboardResponseDto>> Get()
        => Ok(await dashboardService.GetAsync());
}