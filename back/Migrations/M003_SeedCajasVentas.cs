using back.Entities;
using back.Enums;
using back.Domain;
using MongoDB.Bson;
using MongoDB.Driver;

namespace back.Migrations;

public class M003_SeedCajasVentas : IMigration
{
    public string Id => "003_seed_cajas_ventas";

    public async Task Up(IMongoDatabase db, IServiceProvider sp, CancellationToken ct = default)
    {
        var colCajas = db.GetCollection<Caja>("Cajas");
        var colVentas = db.GetCollection<Venta>("Ventas");
        var colProd = db.GetCollection<Producto>("Productos");

        var productos = await colProd.Find(p => p.Activo).ToListAsync(ct);
        if (productos.Count == 0) return;

        var baseDay = DateTime.UtcNow.Date;
        var rand = new Random(101);
        var days = 30;

        for (int d = days; d >= 1; d--)
        {
            var day = baseDay.AddDays(-d);
            var exists = await colCajas.Find(c => c.Apertura >= day && c.Apertura < day.AddDays(1)).AnyAsync(ct);
            if (exists) continue;

            var apertura = day.AddHours(9);
            var cierre = day.AddHours(20);

            var caja = new Caja
            {
                Apertura = apertura,
                MontoInicial = 0,
                Estado = EstadoCaja.Abierta,
                UsuarioId = ObjectId.GenerateNewId().ToString(),
                Observaciones = "Seed (simulada)"
            };
            await colCajas.InsertOneAsync(caja, cancellationToken: ct);

            int ventasCount = rand.Next(6, 18);
            decimal totalDia = 0m;

            for (int i = 0; i < ventasCount; i++)
            {
                var hora = apertura.AddMinutes(rand.Next(0, (int)(cierre - apertura).TotalMinutes));
                int itemsCount = rand.Next(1, 5);
                var items = new List<VentaItem>();

                for (int k = 0; k < itemsCount; k++)
                {
                    var p = productos[rand.Next(productos.Count)];

                    double cant = p.Categoria switch
                    {
                        Categoria.Salsas => Math.Round(rand.NextDouble() * 1.2 + 0.3, 2), // litro
                        Categoria.Tartas or Categoria.Postres => 1,
                        Categoria.Empanadas => 1, // docena
                        _ => Math.Round(rand.NextDouble() * 1.5 + 0.4, 2) // kg aprox.
                    };

                    items.Add(new VentaItem
                    {
                        ProductoId = p.Id,
                        Cantidad = cant,
                        PrecioUnitario = p.Precio
                    });

                    // stock local simulado
                    p.Stock = Math.Max(0, p.Stock - cant);
                }

                var total = items.Sum(x => x.Monto);
                totalDia += total;

                var metodo = (MetodoPago)rand.Next(1, 4); // 1..3

                var venta = new Venta
                {
                    Fecha = hora,
                    Items = items,
                    Total = Math.Round(total, 2),
                    MetodoPago = metodo,
                    UsuarioId = ObjectId.GenerateNewId().ToString(),
                    CajaId = caja.Id,
                    Estado = EstadoVenta.Confirmada
                };

                await colVentas.InsertOneAsync(venta, cancellationToken: ct);
            }

            // cerrar caja
            var delta = (decimal)((rand.NextDouble() - 0.5) * 0.02); // +-1%
            var updateCaja = Builders<Caja>.Update
                .Set(c => c.Cierre, cierre)
                .Set(c => c.MontoCalculado, Math.Round(totalDia, 2))
                .Set(c => c.MontoReal, Math.Round(totalDia * (1 + delta), 2))
                .Set(c => c.Estado, EstadoCaja.Cerrada);

            await colCajas.UpdateOneAsync(c => c.Id == caja.Id, updateCaja, cancellationToken: ct);

            foreach (var p in productos)
            {
                await colProd.UpdateOneAsync(
                    x => x.Id == p.Id,
                    Builders<Producto>.Update
                        .Set(x => x.Stock, p.Stock)
                        .Set(x => x.FechaActualizacion, DateTime.UtcNow),
                    cancellationToken: ct);
            }
        }

        var all = await colProd.Find(_ => true).ToListAsync(ct);
        foreach (var p in all)
        {
            var (_, min, _) = p.Categoria.Defaults();
            if (min > 0 && p.Stock < min)
            {
                var margin = Math.Round(min * 0.20, 2); // 20% arriba del min
                await colProd.UpdateOneAsync(
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
