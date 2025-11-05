using back.Dtos.Usuarios;
using back.Entities;
using back.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(UsuarioService usuarioService) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        Usuario? usuario = await usuarioService.AuthenticateAsync(request.Usuario, request.Clave);
        if (usuario == null) return Unauthorized("Usuario o contraseña inválidos.");
        string token = usuarioService.GenerateJwtToken(usuario);
        return Ok(new { token });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        await usuarioService.RegisterAsync(request.Usuario, request.Clave, request.Rol);
        return Ok();
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll()
    {
        var lista = (await usuarioService.GetAllAsync())
            .Select(u => new UsuarioDto
            {
                Id = u.Id,
                Nombre = u.Username,
                Rol = u.Rol,
                Activo = u.Activo,
                FechaCreacion = u.FechaCreacion
            });
        return Ok(lista);
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioDto>> GetById(string id)
    {
        var u = await usuarioService.GetByIdAsync(id);
        if (u is null) return NotFound();
        return Ok(new UsuarioDto
        {
            Id = u.Id,
            Nombre = u.Username,
            Rol = u.Rol,
            Activo = u.Activo,
            FechaCreacion = u.FechaCreacion
        });
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UsuarioUpdateDto dto)
    {
        await usuarioService.UpdateAsync(
            id,
            dto.Nombre,
            dto.NuevaClave,
            dto.Rol,
            dto.Activo
        );
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpPatch("{id}/activo")]
    public async Task<IActionResult> ToggleActivo(string id, [FromBody] bool activo)
    {
        await usuarioService.UpdateAsync(id, null, null, null, activo);
        return NoContent();
    }
}