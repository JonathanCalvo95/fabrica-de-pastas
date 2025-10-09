using back.Enums;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace back.Entities;

[BsonIgnoreExtraElements]
public class Producto
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public UnidadMedida Medida { get; set; }
    public double Stock { get; set; }
    public TipoProducto Tipo { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;
}