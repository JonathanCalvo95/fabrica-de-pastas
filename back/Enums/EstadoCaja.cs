using System.ComponentModel;

namespace back.Enums;

public enum EstadoCaja
{
    [Description("Abierta")]
    Abierta = 1,
    [Description("Cerrada")]
    Cerrada = 2,
    [Description("Pausada")]
    Pausada = 3
}
