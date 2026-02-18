using back.Entities;
using back.Enums;

namespace back.Dtos.Ventas;

public class VentaListItemDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public List<VentaItem>? Items { get; set; }
    public decimal Total { get; set; }
    public MetodoPago MetodoPago { get; set; }
    public EstadoVenta Estado { get; set; }
    public string? CajaId { get; set; }
}
