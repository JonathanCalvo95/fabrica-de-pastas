using back.Entities;
using back.Enums;
using back.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(UsuarioService usuarioService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        Usuario? usuario = await usuarioService.AuthenticateAsync(request.Username, request.Password);

        if (usuario == null)
        {
            return Unauthorized("Usuario o contraseña inválidos.");
        }

        string token = usuarioService.GenerateJwtToken(usuario);
        return Ok(new { token });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            await usuarioService.RegisterAsync(request.Username, request.Password, request.Rol);
            return Ok("Usuario registrado exitosamente.");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public TipoRol Rol { get; set; }
}
