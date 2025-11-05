using back.Entities;
using back.Enums;
using MongoDB.Driver;

namespace back.Migrations;

public class M001_SeedUsuarios : IMigration
{
    public string Id => "001_seed_usuarios";

    public async Task Up(IMongoDatabase db, IServiceProvider sp, CancellationToken ct = default)
    {
        var usuarios = db.GetCollection<Usuario>("Usuarios");

        var datos = new (string user, string pass, TipoRol rol)[]
        {
            ("admin", "admin123", TipoRol.Administrador),
            ("vendedor", "vendedor123", TipoRol.Vendedor),
            ("productor", "productor123", TipoRol.Productor)
        };

        foreach (var (user, pass, rol) in datos)
        {
            var filter = Builders<Usuario>.Filter.Eq(u => u.Username, user);

            var hash = BCrypt.Net.BCrypt.HashPassword(pass);

            var update = Builders<Usuario>.Update
                .SetOnInsert(u => u.Username, user)
                .Set(u => u.Password, hash)
                .Set(u => u.Rol, rol)
                .SetOnInsert(u => u.Activo, true)
                .SetOnInsert(u => u.FechaCreacion, DateTime.UtcNow);

            await usuarios.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true }, ct);
        }
    }
}
