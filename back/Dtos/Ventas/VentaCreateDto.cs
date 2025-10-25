using back.Enums;

namespace back.Dtos.Ventas;

public class VentaCreateDto
{
    public List<VentaCreateItemDto> Items { get; set; } = [];
    public MetodoPago MetodoPago { get; set; }
    public string? Observaciones { get; set; }
}

public class VentaCreateItemDto
{
    public string ProductoId { get; set; } = string.Empty;
    public double Cantidad { get; set; }
}
