using back.Enums;

namespace back.Dtos.Ventas;

public class VentaDetailDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public List<VentaItemDto> Items { get; set; } = [];
    public decimal Total { get; set; }
    public MetodoPago MetodoPago { get; set; }
    public string? CajaId { get; set; }
    public EstadoVenta Estado { get; set; }
}