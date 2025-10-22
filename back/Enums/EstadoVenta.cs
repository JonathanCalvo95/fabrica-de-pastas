using System.ComponentModel;

namespace back.Enums;

public enum EstadoVenta
{
    [Description("Confirmada")]
    Confirmada = 1,
    [Description("Anulada")]
    Anulada = 2,
    [Description("Devuelta")]
    Devuelta = 3
}
