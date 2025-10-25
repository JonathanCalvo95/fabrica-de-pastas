using back.Entities;
using back.Enums;
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

        if (usuario == null)
        {
            return Unauthorized("Usuario o contraseña inválidos.");
        }

        string token = usuarioService.GenerateJwtToken(usuario);
        return Ok(new { token });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            await usuarioService.RegisterAsync(request.Usuario, request.Clave, request.Rol);
            return Ok("Usuario registrado exitosamente.");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}