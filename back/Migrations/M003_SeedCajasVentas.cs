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

        var baseDay = DateTime.UtcNow.Date; // hoy (UTC)
    // Solo últimos 6 meses (aprox 180 días) hasta ayer
    var startRange = baseDay.AddMonths(-6);
        var rand = new Random(101);
    var totalDays = (int)(baseDay - startRange).TotalDays; // hasta ayer (excluye hoy)

        // Pre-cargamos días ya seed para evitar consultas repetidas
        Console.WriteLine("[M003] Iniciando migración: seed últimos 6 meses...");
        var seededAperturas = await colCajas.Find(_ => true)
            .Project(c => c.Apertura)
            .ToListAsync(ct);
        var seededSet = new HashSet<DateTime>(seededAperturas.Select(d => d.Date));
        Console.WriteLine($"[M003] Días a evaluar: {totalDays} | Días ya seed: {seededSet.Count}");

        var cajasToInsert = new List<Caja>();
        var ventasToInsert = new List<Venta>();
        var productoStockDelta = new Dictionary<string, double>();

        // Generación in-memory (más rápida) de cajas y ventas faltantes
        int generatedDays = 0;
        for (int offset = totalDays; offset >= 1; offset--)
        {
            var day = baseDay.AddDays(-offset).Date;
            if (seededSet.Contains(day)) continue;

            var apertura = day.AddHours(9);
            var cierre = day.AddHours(20);
            var caja = new Caja
            {
                Id = ObjectId.GenerateNewId().ToString(), // asegurar Id antes de usar en ventas
                Apertura = apertura,
                MontoInicial = 0,
                Estado = EstadoCaja.Abierta,
                UsuarioId = ObjectId.GenerateNewId().ToString(),
                Observaciones = "Seed (simulada)"
            };
            cajasToInsert.Add(caja);

            bool isSunday = apertura.DayOfWeek == DayOfWeek.Sunday;
            int ventasCount = isSunday ? rand.Next(3, 10) : rand.Next(6, 18);
            decimal totalDia = 0m;

            for (int i = 0; i < ventasCount; i++)
            {
                var hora = apertura.AddMinutes(rand.Next(0, (int)(cierre - apertura).TotalMinutes));
                int itemsCount = rand.Next(1, 5);
                var itemsMap = new Dictionary<string, VentaItem>();

                for (int k = 0; k < itemsCount; k++)
                {
                    var p = productos[rand.Next(productos.Count)];
                    double cant;
                    var (medida, _, _) = p.Categoria.Defaults();
                    if (medida == Medida.Unidad || medida == Medida.Caja)
                    {
                        // Solo enteros para Unidad/Caja
                        cant = p.Categoria switch
                        {
                            Categoria.Tartas => 1,
                            Categoria.Postres => 1,
                            Categoria.Varios => 1,
                            Categoria.Canelones => rand.Next(1, 4), // 1-3 unidades
                            Categoria.Pizzas => rand.Next(1, 3), // 1-2 pizzas
                            Categoria.Empanadas => rand.Next(1, 5), // docenas 1-4
                            Categoria.Ravioles => rand.Next(1, 5), // cajas 1-4
                            _ => 1
                        };
                    }
                    else if (p.Categoria == Categoria.Salsas)
                    {
                        cant = Math.Round(rand.NextDouble() * 1.2 + 0.3, 2); // litros con decimales
                    }
                    else
                    {
                        cant = Math.Round(rand.NextDouble() * 1.2 + 0.3, 2); // otras medidas con decimales
                    }
                    if (itemsMap.TryGetValue(p.Id, out var existing))
                    {
                        existing.Cantidad += cant;
                    }
                    else
                    {
                        itemsMap[p.Id] = new VentaItem { ProductoId = p.Id, Cantidad = cant, PrecioUnitario = p.Precio };
                    }

                    if (!productoStockDelta.ContainsKey(p.Id)) productoStockDelta[p.Id] = 0;
                    productoStockDelta[p.Id] += cant;
                }

                var items = itemsMap.Values.ToList();
                var total = items.Sum(x => x.Monto);
                totalDia += total;
                var metodo = (MetodoPago)rand.Next(1, 4);
                ventasToInsert.Add(new Venta
                {
                    Fecha = hora,
                    Items = items,
                    Total = Math.Round(total, 2),
                    MetodoPago = metodo,
                    UsuarioId = ObjectId.GenerateNewId().ToString(),
                    CajaId = caja.Id,
                    Estado = EstadoVenta.Realizada
                });
            }

            // Actualización final de caja se hará luego con BulkWrite
            var delta = (decimal)((rand.NextDouble() - 0.5) * 0.02);
            caja.Cierre = cierre;
            caja.MontoCalculado = Math.Round(totalDia, 2);
            caja.MontoReal = Math.Round(totalDia * (1 + delta), 2);
            caja.Estado = EstadoCaja.Cerrada;

            generatedDays++;
            if (generatedDays % 30 == 0)
            {
                Console.WriteLine($"[M003] Días generados hasta ahora: {generatedDays}");
            }
        }

        // Bulk insert para cajas y ventas (reduce round trips)
        Console.WriteLine($"[M003] Insertando cajas: {cajasToInsert.Count} | ventas: {ventasToInsert.Count}");
        if (cajasToInsert.Count > 0)
            await colCajas.InsertManyAsync(cajasToInsert, cancellationToken: ct);
        if (ventasToInsert.Count > 0)
            await colVentas.InsertManyAsync(ventasToInsert, cancellationToken: ct);

        // Aplicar deltas de stock acumulados en lote
        if (productoStockDelta.Count > 0)
        {
            var bulkProd = new List<WriteModel<Producto>>();
            foreach (var p in productos)
            {
                if (productoStockDelta.TryGetValue(p.Id, out var used))
                {
                    var newStock = Math.Max(0, p.Stock - used);
                    bulkProd.Add(new UpdateManyModel<Producto>(
                        Builders<Producto>.Filter.Eq(x => x.Id, p.Id),
                        Builders<Producto>.Update
                            .Set(x => x.Stock, newStock)
                            .Set(x => x.FechaActualizacion, DateTime.UtcNow)
                    ));
                }
            }
            if (bulkProd.Count > 0)
                await colProd.BulkWriteAsync(bulkProd, cancellationToken: ct);
        }

        // Ajuste final de stock mínimo usando Bulk para productos por debajo del umbral
        var all = await colProd.Find(_ => true).ToListAsync(ct);
        var bulkAdjust = new List<WriteModel<Producto>>();
        foreach (var p in all)
        {
            var (_, min, _) = p.Categoria.Defaults();
            if (min > 0 && p.Stock < min)
            {
                var margin = Math.Round(min * 0.20, 2);
                bulkAdjust.Add(new UpdateOneModel<Producto>(
                    Builders<Producto>.Filter.Eq(x => x.Id, p.Id),
                    Builders<Producto>.Update
                        .Set(x => x.Stock, min + margin)
                        .Set(x => x.FechaActualizacion, DateTime.UtcNow)
                ));
            }
        }
        if (bulkAdjust.Count > 0)
            await colProd.BulkWriteAsync(bulkAdjust, cancellationToken: ct);

        Console.WriteLine("[M003] Migración completada.");
    }
}
