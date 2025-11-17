using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using back.Enums;

namespace back.Entities;

public class Pedido
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public string? Cliente { get; set; }
    public string? Observaciones { get; set; }
    public EstadoPedido Estado { get; set; } = EstadoPedido.Pendiente;

    public List<PedidoItem> Items { get; set; } = [];

    [BsonRepresentation(BsonType.ObjectId)]
    public string? VentaId { get; set; }

    public string? UsuarioId { get; set; }
}

public class PedidoItem
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string ProductoId { get; set; } = string.Empty;
    public double Cantidad { get; set; }
}
