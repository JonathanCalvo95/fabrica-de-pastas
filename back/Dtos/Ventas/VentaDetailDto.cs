using back.Enums;

namespace back.Dtos.Ventas;

public class VentaDetailDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public List<VentaItemDto> Productos { get; set; } = [];
    public decimal Total { get; set; }
    public MetodoPago MetodoPago { get; set; }
    public string? CajaId { get; set; }
    public EstadoVenta Estado { get; set; }
}

public class VentaItemDto
{
    public string ProductoId { get; set; } = string.Empty;
    public Categoria? Categoria { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public double Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Monto { get; set; }
}
