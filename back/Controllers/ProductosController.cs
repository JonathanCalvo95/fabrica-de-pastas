using FabricaDePastas.Back.Data;
using FabricaDePastas.Back.Entities;
using Microsoft.AspNetCore.Mvc;

namespace FabricaDePastas.Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController(IProductoRepo repo) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Producto>> GetAll() => Ok(repo.GetAll());

    [HttpGet("{id}")]
    public ActionResult<Producto> GetById(string id)
    {
        var p = repo.GetById(id);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpPost]
    public ActionResult<Producto> Create([FromBody] Producto p)
    {
        if (string.IsNullOrWhiteSpace(p.Nombre))
            return BadRequest("Nombre es obligatorio.");

        var created = repo.Add(p);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] Producto p)
    {
        var ok = repo.Update(id, p);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var ok = repo.Delete(id);
        return ok ? NoContent() : NotFound();
    }
}
