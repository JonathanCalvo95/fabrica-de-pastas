using back.Enums;
using back.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CajaController(ICajaService service) : BaseApiController
{
    [HttpGet("current")]
    [ProducesResponseType(typeof(CajaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetCurrent()
    {
        var caja = await service.GetOpenAsync();
        if (caja is null) return NoContent();
        return Ok(ToDto(caja));
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CajaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHistory([FromQuery] int take = 50)
    {
        var list = await service.GetHistoryAsync(take);
        return Ok(list.Select(ToDto));
    }

    [HttpGet("cash-sales")]
    [ProducesResponseType(typeof(decimal), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCashSales()
    {
        var total = await service.GetVentasEfectivoAsync();
        return Ok(total);
    }

    [HttpPost("open")]
    [Authorize(Roles = nameof(TipoRol.Administrador) + "," + nameof(TipoRol.Vendedor))]
    [ProducesResponseType(typeof(CajaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Open([FromBody] CajaRequestDto req)
    {
        try
        {
            var sesion = await service.OpenAsync(UserId, req);
            return CreatedAtAction(nameof(GetCurrent), new { }, ToDto(sesion));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpPost("close")]
    [Authorize(Roles = nameof(TipoRol.Administrador) + "," + nameof(TipoRol.Vendedor))]
    public async Task<IActionResult> Close([FromBody] CajaRequestDto req)
    {
        try
        {
            var ok = await service.CloseAsync(UserId, req);
            return ok ? NoContent() : Conflict("No se pudo cerrar la caja.");
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    private static CajaDto ToDto(back.Entities.Caja s) => new()
    {
        Id = s.Id,
        Apertura = s.Apertura,
        Cierre = s.Cierre,
        MontoInicial = s.MontoInicial,
        MontoCalculado = s.MontoCalculado,
        MontoReal = s.MontoReal,
        UsuarioId = s.UsuarioId,
        Estado = s.Estado,
        Observaciones = s.Observaciones
    };
}
