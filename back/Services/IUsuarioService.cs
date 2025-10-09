using back.Entities;
using back.Enums;

namespace back.Services;

public interface IUsuarioService
{
    Task<Usuario?> AuthenticateAsync(string username, string password);
    Task RegisterAsync(string username, string password, TipoRol rol);
}
