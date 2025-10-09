using back.Entities;

namespace back.Repositories;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByUsernameAsync(string username);
    Task AddAsync(Usuario user);
    Task<Usuario?> GetByIdAsync(string id);
}
