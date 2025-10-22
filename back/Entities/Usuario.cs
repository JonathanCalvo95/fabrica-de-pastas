
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using back.Enums;

namespace back.Entities;

public class Usuario
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("usuario")]
    public string Username { get; set; } = string.Empty;

    [BsonElement("contraseña")]
    public string Password { get; set; } = string.Empty;

    [BsonElement("rol")]
    public TipoRol Rol { get; set; }
}
