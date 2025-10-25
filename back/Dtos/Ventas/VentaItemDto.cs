using back.Enums;

namespace back.Dtos.Ventas;

public class VentaItemDto
{
    public string ProductoId { get; set; } = string.Empty;
    public Categoria? Categoria { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public double Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Monto { get; set; }
}
