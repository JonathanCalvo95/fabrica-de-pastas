using MongoDB.Driver;

namespace back.Migrations;

public interface IMigration
{
    string Id { get; }
    Task Up(IMongoDatabase db, IServiceProvider sp, CancellationToken ct = default);
}
