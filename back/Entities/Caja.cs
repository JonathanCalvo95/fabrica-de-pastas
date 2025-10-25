using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using back.Enums;

namespace back.Entities;

[BsonIgnoreExtraElements]
public class Caja
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public DateTime Apertura { get; set; }
    public DateTime? Cierre { get; set; }

    public decimal MontoInicial { get; set; }
    public decimal? MontoCalculado { get; set; }
    public decimal? MontoReal { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string UsuarioId { get; set; } = string.Empty;

    public EstadoCaja Estado { get; set; } = EstadoCaja.Abierta;
    public string Observaciones { get; set; } = string.Empty;
}
