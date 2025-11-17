using back.Entities;
using back.Enums;
using back.Domain;
using MongoDB.Bson;
using MongoDB.Driver;

namespace back.Migrations;

public class M004_SeedPedidos : IMigration
{
    public string Id => "004_seed_pedidos";

    public async Task Up(IMongoDatabase db, IServiceProvider sp, CancellationToken ct = default)
    {
        var colPedidos = db.GetCollection<Pedido>("Pedidos");
        var colProd = db.GetCollection<Producto>("Productos");
        var colUsers = db.GetCollection<Usuario>("Usuarios");

        // Si ya hay pedidos, no hacer nada (idempotente)
        var existing = await colPedidos.Find(_ => true).Limit(1).FirstOrDefaultAsync(ct);
        if (existing is not null) return;

        var productos = await colProd.Find(p => p.Activo).ToListAsync(ct);
        var usuarios = await colUsers.Find(u => u.Activo).ToListAsync(ct);
        if (productos.Count == 0 || usuarios.Count == 0) return;

        var rand = new Random(404);
        var baseDay = DateTime.UtcNow.Date;

        var pedidos = new List<Pedido>();

        // Generar ~40 pedidos distribuidos en los últimos 30 días
        int total = 40;
        for (int i = 0; i < total; i++)
        {
            var dayOffset = rand.Next(0, 30);
            var fecha = baseDay.AddDays(-dayOffset).AddHours(10 + rand.Next(0, 9));

            var usuario = usuarios[rand.Next(usuarios.Count)];

            int itemsCount = rand.Next(1, 4);
            var items = new Dictionary<string, PedidoItem>();
            for (int k = 0; k < itemsCount; k++)
            {
                var p = productos[rand.Next(productos.Count)];
                double cant;
                var (medida, _, _) = p.Categoria.Defaults();
                if (medida == Medida.Unidad || medida == Medida.Caja)
                {
                    cant = p.Categoria switch
                    {
                        Categoria.Tartas => 1,
                        Categoria.Postres => 1,
                        Categoria.Varios => 1,
                        Categoria.Canelones => rand.Next(1, 4),
                        Categoria.Pizzas => rand.Next(1, 3),
                        Categoria.Empanadas => rand.Next(1, 5),
                        Categoria.Ravioles => rand.Next(1, 5),
                        _ => 1
                    };
                }
                else if (p.Categoria == Categoria.Salsas)
                {
                    cant = Math.Round(rand.NextDouble() * 1.2 + 0.3, 2);
                }
                else
                {
                    cant = Math.Round(rand.NextDouble() * 1.2 + 0.3, 2);
                }

                if (items.TryGetValue(p.Id, out var ex)) ex.Cantidad += cant;
                else items[p.Id] = new PedidoItem { ProductoId = p.Id, Cantidad = cant };
            }

            // Estados distribuidos
            var estado = (EstadoPedido)rand.Next(1, 5); // 1..4

            var pedido = new Pedido
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Fecha = fecha,
                Cliente = rand.Next(0, 3) == 0 ? $"Cliente {rand.Next(100, 999)}" : null,
                Observaciones = rand.Next(0, 5) == 0 ? "Pedido de prueba" : null,
                Estado = estado,
                Items = items.Values.ToList(),
                UsuarioId = usuario.Id
            };

            pedidos.Add(pedido);
        }

        if (pedidos.Count > 0)
            await colPedidos.InsertManyAsync(pedidos, cancellationToken: ct);
    }
}
