using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using back.Entities;
using back.Enums;
using back.Services;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductosController(IProductoService service, IMapper mapper) : ControllerBase
{
    // GET: api/Productos
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductoListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductoListItemDto>>> GetAll()
    {
        var productos = await service.GetAllAsync(activos: true);
        var result = mapper.Map<IEnumerable<ProductoListItemDto>>(productos);
        return Ok(result);
    }

    // GET: api/Productos/{id}
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductoListItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductoListItemDto>> GetById(string id)
    {
        var producto = await service.GetByIdAsync(id);
        if (producto is null) return NotFound();

        var dto = mapper.Map<ProductoListItemDto>(producto);
        return Ok(dto);
    }

    // POST: api/Productos
    [HttpPost]
    [Authorize(Roles = nameof(TipoRol.Administrador))]
    [ProducesResponseType(typeof(ProductoListItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductoListItemDto>> Create([FromBody] ProductoCreateUpdateDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        try
        {
            var entity = mapper.Map<Producto>(dto);
            await service.AddAsync(entity);

            var result = mapper.Map<ProductoListItemDto>(entity);
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Productos/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = nameof(TipoRol.Administrador) + "," + nameof(TipoRol.Productor))]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string id, [FromBody] ProductoCreateUpdateDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var existing = await service.GetByIdAsync(id);
        if (existing is null) return NotFound();

        mapper.Map(dto, existing);
        existing.FechaActualizacion = DateTime.UtcNow;

        var ok = await service.UpdateAsync(id, existing);
        return ok ? NoContent() : NotFound();
    }

    // DELETE: api/Productos/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(TipoRol.Administrador))]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id)
    {
        var ok = await service.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
