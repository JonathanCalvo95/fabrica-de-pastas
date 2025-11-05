using MongoDB.Driver;
using back.Configuration;
using back.Entities;

namespace back.Repositories;

public class UsuarioRepository(MongoDbContext context) : IUsuarioRepository
{
    private readonly IMongoCollection<Usuario> _usuarios = context.Usuarios;

    public async Task<IEnumerable<Usuario>> GetAllAsync()
        => await _usuarios.Find(_ => true).ToListAsync();

    public async Task<Usuario?> GetByIdAsync(string id)
        => await _usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<Usuario?> GetByUsernameAsync(string username)
        => await _usuarios.Find(u => u.Username == username).FirstOrDefaultAsync();

    public async Task AddAsync(Usuario usuario)
        => await _usuarios.InsertOneAsync(usuario);

    public async Task UpdateAsync(Usuario usuario)
        => await _usuarios.ReplaceOneAsync(u => u.Id == usuario.Id, usuario);
}
