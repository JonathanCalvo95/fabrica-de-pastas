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
        var usuario = await _repo.GetByUsernameAsync(username);
        if (usuario == null || !BCrypt.Net.BCrypt.Verify(password, usuario.Password))
            return null;
        return usuario;
    }

    public async Task RegisterAsync(string username, string password, TipoRol rol)
    {
        var existente = await _repo.GetByUsernameAsync(username);
        if (existente != null) throw new ArgumentException("El nombre de usuario ya existe.");

        var usuario = new Usuario
        {
            Username = username,
            Password = BCrypt.Net.BCrypt.HashPassword(password),
            Rol = rol,
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };
        await _repo.AddAsync(usuario);
    }

    public async Task<IEnumerable<Usuario>> GetAllAsync() => await _repo.GetAllAsync();

    public async Task<Usuario?> GetByIdAsync(string id) => await _repo.GetByIdAsync(id);

    public async Task UpdateAsync(string id, string? nuevoNombre, string? nuevaClave, TipoRol? nuevoRol, bool? activo)
    {
        var user = await _repo.GetByIdAsync(id) ?? throw new KeyNotFoundException("Usuario no encontrado.");
        if (!string.IsNullOrWhiteSpace(nuevoNombre)) user.Username = nuevoNombre;
        if (!string.IsNullOrWhiteSpace(nuevaClave)) user.Password = BCrypt.Net.BCrypt.HashPassword(nuevaClave);
        if (nuevoRol.HasValue) user.Rol = nuevoRol.Value;
        if (activo.HasValue) user.Activo = activo.Value;
        await _repo.UpdateAsync(user);
    }

    public string GenerateJwtToken(Usuario usuario)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, usuario.Rol.ToString()),
            new Claim("activo", usuario.Activo.ToString()),
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
