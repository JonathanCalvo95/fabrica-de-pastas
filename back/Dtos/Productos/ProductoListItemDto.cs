using back.Enums;

public class ProductoListItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public double Stock { get; set; }
    public double StockMinimo { get; set; }
    public double StockMaximo { get; set; }
    public Medida Medida { get; set; }
    public Categoria Categoria { get; set; }
    public bool Activo { get; set; }
}
