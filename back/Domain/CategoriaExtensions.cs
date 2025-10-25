using back.Enums;

namespace back.Domain;

public static class CategoriaExtensions
{
    public static (Medida medida, double min, double max) Defaults(this Categoria c) => c switch
    {
        Categoria.Ravioles      => (Medida.Caja,   10, 60),
        Categoria.Canelones     => (Medida.Unidad, 5,  40),
        Categoria.Agnolottis    => (Medida.Kg,     5,  40),
        Categoria.Tallarines    => (Medida.Kg,     10, 80),
        Categoria.Ñoquis        => (Medida.Kg,     10, 80),
        Categoria.Sorrentinos   => (Medida.Kg,     5,  40),
        Categoria.Capelettis    => (Medida.Kg,     5,  40),
        Categoria.Tortellettis  => (Medida.Kg,     5,  40),
        Categoria.Lasagna       => (Medida.Kg,     2,  10),
        Categoria.Salsas        => (Medida.Litro,  5,  30),
        Categoria.Tartas        => (Medida.Unidad, 5,  20),
        Categoria.Varios        => (Medida.Unidad, 5,  20),
        Categoria.Postres       => (Medida.Unidad, 5,  15),
        Categoria.Pizzas        => (Medida.Unidad, 10, 40),
        Categoria.Empanadas     => (Medida.Unidad, 10, 40),
        _                       => (Medida.Unidad, 0,  0)
    };
}
