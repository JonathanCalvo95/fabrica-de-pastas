using back.Enums;

public class ProductoCreateUpdateDto
{
    public Categoria Categoria { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public double Stock { get; set; }
    public bool Activo { get; set; } = true;
}
