using back.Enums;

public class ProductoListItemDto
{
    public string Id { get; set; } = string.Empty;
    public Categoria Categoria { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public double Stock { get; set; }
    public double StockMinimo { get; set; }
    public double StockMaximo { get; set; }
    public Medida Medida { get; set; }
    public bool Activo { get; set; }
    public string? FechaCreacion { get; set; }
    public string? FechaActualizacion { get; set; }
}
