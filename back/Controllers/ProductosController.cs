using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using back.Entities;
using back.Enums;
using back.Services;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductosController(IProductoService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Producto>>> GetAll()
    {
        IEnumerable<Producto> productos = await service.GetAllAsync();
        return Ok(productos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Producto>> GetById(string id)
    {
        Producto? producto = await service.GetByIdAsync(id);
        return producto is null ? NotFound() : Ok(producto);
    }

    [HttpPost]
    [Authorize(Roles = nameof(TipoRol.Administrador))]
    public async Task<ActionResult<Producto>> Create([FromBody] Producto p)
    {
        try
        {
            await service.AddAsync(p);
            return CreatedAtAction(nameof(GetById), new { id = p.Id }, p);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = nameof(TipoRol.Administrador) + "," + nameof(TipoRol.Productor))]
    public async Task<IActionResult> Update(string id, [FromBody] Producto p)
    {
        bool ok = await service.UpdateAsync(id, p);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(TipoRol.Administrador))]
    public async Task<IActionResult> Delete(string id)
    {
        bool ok = await service.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
