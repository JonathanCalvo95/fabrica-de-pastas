using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FabricaDePastas.Back.Entities;

public class Producto
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!; // Mongo genera ObjectId si no lo seteás

    [BsonElement("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [BsonElement("categoria")]
    public string Categoria { get; set; } = string.Empty;

    [BsonElement("precio")]
    public decimal Precio { get; set; }

    [BsonElement("activo")]
    public bool Activo { get; set; } = true;
}
