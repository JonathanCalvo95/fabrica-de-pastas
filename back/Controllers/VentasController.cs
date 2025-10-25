using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using back.Dtos.Ventas;
using back.Services;
using back.Enums;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VentasController(IVentaService service) : BaseApiController
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<VentaListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLast([FromQuery] int take = 50)
        => Ok(await service.GetLastAsync(take));

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(VentaDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        var v = await service.GetByIdAsync(id);
        return v is null ? NotFound() : Ok(v);
    }

    [HttpPost]
    [Authorize(Roles = nameof(TipoRol.Administrador) + "," + nameof(TipoRol.Vendedor))]
    [ProducesResponseType(typeof(VentaDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] VentaCreateDto dto)
    {
        try
        {
            var created = await service.CreateAsync(dto, UserId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }
}
