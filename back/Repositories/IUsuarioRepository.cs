using back.Entities;

namespace back.Repositories;

public interface IUsuarioRepository
{
    Task<IEnumerable<Usuario>> GetAllAsync();
    Task<Usuario?> GetByIdAsync(string id);
    Task<Usuario?> GetByUsernameAsync(string username);
    Task AddAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
}
