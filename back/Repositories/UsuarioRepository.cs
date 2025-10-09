using MongoDB.Driver;
using back.Configuration;
using back.Entities;

namespace back.Repositories;

public class UsuarioRepository(MongoDbContext context) : IUsuarioRepository
{
    private readonly IMongoCollection<Usuario> _usuarios = context.Usuarios;

    public async Task<Usuario?> GetByUsernameAsync(string username)
    {
        FilterDefinition<Usuario> filter = Builders<Usuario>.Filter.Eq(u => u.Username, username);
        return await _usuarios.Find(filter).FirstOrDefaultAsync();
    }
    
    public async Task<Usuario?> GetByIdAsync(string id)
    {
        FilterDefinition<Usuario> filter = Builders<Usuario>.Filter.Eq(u => u.Id, id);
        return await _usuarios.Find(filter).FirstOrDefaultAsync();
    }

    public async Task AddAsync(Usuario usuario)
    {
        await _usuarios.InsertOneAsync(usuario);
    }
}
