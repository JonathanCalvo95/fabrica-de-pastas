using System.ComponentModel;

namespace back.Enums;

public enum TipoProducto
{
    [Description("Pasta Simple")]
    Simple = 1,
    [Description("Pasta Rellena")]
    Rellena = 2,
    [Description("Salsa")]
    Salsa = 3,
    [Description("Postre")]
    Postre = 4,
    [Description("Queso rallado")]
    QuesoRallado = 5
}
