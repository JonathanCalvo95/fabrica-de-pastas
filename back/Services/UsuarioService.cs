using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using back.Entities;
using back.Enums;
using back.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace back.Services;

public class UsuarioService(IUsuarioRepository repo, IConfiguration configuration) : IUsuarioService
{
    private readonly IUsuarioRepository _repo = repo;
    private readonly IConfiguration _configuration = configuration;

    public async Task<Usuario?> AuthenticateAsync(string username, string password)
    {
        Usuario? usuario = await _repo.GetByUsernameAsync(username);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(password, usuario.Password))
        {
            return null;
        }

        return usuario;
    }

    public async Task RegisterAsync(string username, string password, TipoRol rol)
    {
        Usuario? usuarioExistente = await _repo.GetByUsernameAsync(username);
        if (usuarioExistente != null)
        {
            throw new ArgumentException("El nombre de usuario ya existe.");
        }

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
        Usuario usuario = new()
        {
            Username = username,
            Password = hashedPassword,
            Rol = rol
        };

        await _repo.AddAsync(usuario);
    }

    public string GenerateJwtToken(Usuario usuario)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
        );
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, usuario.Rol.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(4),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

}
