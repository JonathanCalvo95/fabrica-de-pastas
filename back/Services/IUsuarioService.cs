using back.Entities;
using back.Enums;

namespace back.Services;

public interface IUsuarioService
{
    Task<Usuario?> AuthenticateAsync(string username, string password);
    Task RegisterAsync(string username, string password, TipoRol rol);
    Task<IEnumerable<Usuario>> GetAllAsync();
    Task<Usuario?> GetByIdAsync(string id);
    Task UpdateAsync(string id, string? nuevoNombre, string? nuevaClave, TipoRol? nuevoRol, bool? activo);
    string GenerateJwtToken(Usuario usuario);
}
