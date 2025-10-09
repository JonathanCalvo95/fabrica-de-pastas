using System.ComponentModel;

namespace back.Enums;

public enum TipoRol
{
    [Description("Administrador")]
    Administrador = 1,
    [Description("Productor")]
    Productor = 2,
    [Description("Vendedor")]
    Vendedor = 3
}
