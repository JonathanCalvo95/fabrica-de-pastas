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
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
        byte[] key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "");

        List<Claim> claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, usuario.Rol.ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id)
        };

        SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
