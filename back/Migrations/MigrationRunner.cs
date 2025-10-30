using MongoDB.Bson;
using MongoDB.Driver;

namespace back.Migrations;

public class MigrationRunner
{
    private readonly IMongoDatabase _db;
    private readonly IEnumerable<IMigration> _migrations;
    private const string Coll = "_migrations";

    public MigrationRunner(IMongoDatabase db, IEnumerable<IMigration> migrations)
    {
        _db = db;
        _migrations = migrations.OrderBy(m => m.Id, StringComparer.Ordinal);
    }

    public async Task RunAsync(IServiceProvider sp, CancellationToken ct = default)
    {
        var appliedIds = (await _db.GetCollection<BsonDocument>(Coll)
            .Find(FilterDefinition<BsonDocument>.Empty)
            .Project("{ _id: 1 }")
            .ToListAsync(ct))
            .Select(x => x["_id"].AsString)
            .ToHashSet();

        foreach (var m in _migrations)
        {
            if (appliedIds.Contains(m.Id)) continue;

            await m.Up(_db, sp, ct);

            await _db.GetCollection<BsonDocument>(Coll)
                .InsertOneAsync(new BsonDocument
                {
                    { "_id", m.Id },
                    { "appliedAt", DateTime.UtcNow }
                }, cancellationToken: ct);
        }
    }
}
