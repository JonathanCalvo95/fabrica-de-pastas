using back.Enums;

public class ProductoCreateUpdateDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public Medida Medida { get; set; }
    public double Stock { get; set; }
    public double StockMinimo { get; set; } = 0;
    public double StockMaximo { get; set; } = 0;
    public Categoria Categoria { get; set; }
    public bool Activo { get; set; } = true;
}
