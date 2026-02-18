using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using back.Enums;

namespace back.Entities;

public class Venta
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public List<VentaItem> Items { get; set; } = [];
    public decimal Total { get; set; }
    public MetodoPago MetodoPago { get; set; }
    public string? UsuarioId { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string? CajaId { get; set; }

    public EstadoVenta Estado { get; set; } = EstadoVenta.Realizada;
}

public class VentaItem
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string ProductoId { get; set; } = string.Empty;

    public double Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Monto => Math.Round(PrecioUnitario * (decimal)Cantidad, 2);
}
