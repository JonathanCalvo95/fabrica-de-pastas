using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Bson;
using MongoDB.Driver;
using back.Configuration;
using back.Migrations;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // igual que tu política de acceso admin
public class SeedController(MongoDbContext ctx, MigrationRunner runner) : BaseApiController
{
    private readonly IMongoDatabase _db = ctx.Database;
    private readonly MigrationRunner _runner = runner;

    /// <summary>
    /// Ejecuta las migraciones pendientes (no borra datos).
    /// </summary>
    [HttpPost("run")]
    public async Task<IActionResult> Run(CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        await _runner.RunAsync(HttpContext.RequestServices, ct);
        sw.Stop();
        return Ok(new { ok = true, elapsedMs = sw.ElapsedMilliseconds, action = "run" });
    }

    /// <summary>
    /// Borra Productos, Cajas, Ventas y _migrations; vuelve a correr migraciones (requiere confirm=true).
    /// </summary>
    [HttpPost("reset")]
    public async Task<IActionResult> Reset([FromQuery] bool confirm = false, CancellationToken ct = default)
    {
        if (!confirm) return BadRequest(new { ok = false, message = "Falta confirm=true" });

        var sw = Stopwatch.StartNew();

        async Task DropIfExists(string name)
        {
            var filter = new BsonDocument("name", name);
            using var cursor = await _db.ListCollectionsAsync(new ListCollectionsOptions { Filter = filter }, ct);
            if (await cursor.AnyAsync(ct))
            {
                await _db.DropCollectionAsync(name, ct);
            }
        }

        await DropIfExists("Productos");
        await DropIfExists("Cajas");
        await DropIfExists("Ventas");
        await DropIfExists("_migrations");

        await _runner.RunAsync(HttpContext.RequestServices, ct);

        sw.Stop();
        return Ok(new { ok = true, elapsedMs = sw.ElapsedMilliseconds, action = "reset" });
    }
}
