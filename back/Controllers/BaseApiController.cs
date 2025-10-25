using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace back.Controllers;

[ApiController]
[Authorize]
public abstract class BaseApiController : ControllerBase
{
    protected string UserId =>
        User?.FindFirst("sub")?.Value ??
        User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
        User?.Identity?.Name ?? "unknown";
}
