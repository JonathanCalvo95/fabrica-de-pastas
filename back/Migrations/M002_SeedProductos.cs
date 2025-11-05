using back.Entities;
using back.Enums;
using back.Domain;
using MongoDB.Driver;

namespace back.Migrations;

public class M002_SeedProductos : IMigration
{
    public string Id => "002_seed_productos";

    public async Task Up(IMongoDatabase db, IServiceProvider sp, CancellationToken ct = default)
    {
        var productos = db.GetCollection<Producto>("Productos");
        var rand = new Random(20251029);

        var seed = new (Categoria cat, string desc, decimal precio, double stock)[] {
            // Ravioles
            (Categoria.Ravioles, "Pollo y Verdura", 4800, 10),
            (Categoria.Ravioles, "Verdura", 4700, 12),
            (Categoria.Ravioles, "Carne y Verdura", 4900, 10),
            (Categoria.Ravioles, "Pollo y Jamón", 4900, 10),
            (Categoria.Ravioles, "Ricota", 5000, 12),
            (Categoria.Ravioles, "Ricota y Queso", 5100, 12),
            (Categoria.Ravioles, "Ricota y Jamón", 5100, 12),
            (Categoria.Ravioles, "Ricota y Verdura", 5100, 12),
            (Categoria.Ravioles, "Ricota y Nuez", 5200, 12),
            (Categoria.Ravioles, "Ricota, Jamón y Muzzarella", 5300, 10),
            (Categoria.Ravioles, "Sesos y Espinaca", 5200, 8),
            (Categoria.Ravioles, "Caseritos", 5200, 10),
            (Categoria.Ravioles, "A los cuatro quesos", 5400, 10),

            // Canelones
            (Categoria.Canelones, "Pollo y Verdura", 5000, 8),
            (Categoria.Canelones, "Verdura sola", 4900, 8),
            (Categoria.Canelones, "Jamón y Queso", 5100, 8),

            // Agnolottis
            (Categoria.Agnolottis, "Ricota", 5200, 8),
            (Categoria.Agnolottis, "Ricota, Jamón y Nuez", 5400, 7),
            (Categoria.Agnolottis, "Pollo y Verdura", 5200, 7),

            // Tallarines
            (Categoria.Tallarines, "Al puro huevo", 3800, 25),
            (Categoria.Tallarines, "Al morrón", 3900, 16),
            (Categoria.Tallarines, "Mostacholes", 3800, 20),
            (Categoria.Tallarines, "Macarrones", 3800, 18),

            // Ñoquis
            (Categoria.Ñoquis, "Papa", 4200, 18),
            (Categoria.Ñoquis, "Verdura", 4300, 14),
            (Categoria.Ñoquis, "Morrón", 4300, 12),
            (Categoria.Ñoquis, "Ricota", 4400, 12),

            // Sorrentinos
            (Categoria.Sorrentinos, "Ricota, Muzzarella y Jamón", 5600, 10),

            // Capelettis / Tortellettis / Salsas
            (Categoria.Capelettis, "Con pollo, choclo y parmesano", 5600, 8),
            (Categoria.Tortellettis, "Pollo y Jamón", 5500, 8),
            (Categoria.Salsas, "Bolognesa", 4300, 10),
            (Categoria.Salsas, "Blanca", 4200, 10),
            (Categoria.Salsas, "Pesto", 4800, 8),

            // Tartas / Empanadas / Postres
            (Categoria.Tartas, "Verdura", 3400, 12),
            (Categoria.Tartas, "Jamón y Queso", 3500, 10),
            (Categoria.Empanadas, "Carne", 6900, 10),
            (Categoria.Empanadas, "Jamón y Queso", 6700, 10),
            (Categoria.Postres, "Flan Casero", 2800, 12),
            (Categoria.Postres, "Mousse de chocolate", 3000, 10),
        };

        foreach (var (cat, desc, precio, stock) in seed)
        {
            var (_, min, _) = cat.Defaults();
            var margin = min > 0 ? Math.Round(min * (0.10 + rand.NextDouble() * 0.20), 2) : 0;
            var targetStock = Math.Max(stock, min + margin);

            var filter = Builders<Producto>.Filter.Where(p => p.Categoria == cat && p.Descripcion == desc);
            var update = Builders<Producto>.Update
                .SetOnInsert(p => p.Activo, true)
                .SetOnInsert(p => p.FechaCreacion, DateTime.UtcNow)
                .Set(p => p.Precio, precio)
                .Set(p => p.Stock, targetStock)
                .Set(p => p.FechaActualizacion, DateTime.UtcNow);

            await productos.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true }, ct);
        }

        var all = await productos.Find(_ => true).ToListAsync(ct);
        foreach (var p in all)
        {
            var (_, min, _) = p.Categoria.Defaults();
            if (min > 0 && p.Stock < min)
            {
                var margin = Math.Round(min * 0.15, 2);
                await productos.UpdateOneAsync(
                    x => x.Id == p.Id,
                    Builders<Producto>.Update
                        .Set(x => x.Stock, min + margin)
                        .Set(x => x.FechaActualizacion, DateTime.UtcNow),
                    cancellationToken: ct
                );
            }
        }
    }
}
