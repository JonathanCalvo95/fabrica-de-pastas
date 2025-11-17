using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using back.Dtos.Pedidos;
using back.Enums;
using back.Services;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PedidosController(IPedidoService service) : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PedidoListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] EstadoPedido[]? estados)
        => Ok(await service.GetAllAsync(estados));

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PedidoDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var res = await service.GetByIdAsync(id);
        return res is null ? NotFound() : Ok(res);
    }

    [HttpPost]
    [Authorize(Roles = nameof(TipoRol.Administrador) + "," + nameof(TipoRol.Vendedor))]
    [ProducesResponseType(typeof(PedidoDetailDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] PedidoCreateDto dto)
    {
        var created = await service.CreateAsync(dto, UserId);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("{id}/estado")]
    [Authorize(Roles = nameof(TipoRol.Administrador) + "," + nameof(TipoRol.Vendedor))]
    [ProducesResponseType(typeof(PedidoDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEstado(string id, [FromBody] PedidoEstadoUpdateDto dto)
    {
        var updated = await service.UpdateEstadoAsync(id, dto.Estado);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(TipoRol.Administrador))]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string id)
    {
        var ok = await service.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("{id}/generar-venta")]
    [Authorize(Roles = nameof(TipoRol.Administrador) + "," + nameof(TipoRol.Vendedor))]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerarVenta(string id, [FromBody] GenerarVentaDesdePedidoDto dto)
    {
        try
        {
            var (ventaId, pedidoId) = await service.GenerarVentaDesdePedidoAsync(id, dto, UserId);
            return Ok(new { ventaId, pedidoId });
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }
}
