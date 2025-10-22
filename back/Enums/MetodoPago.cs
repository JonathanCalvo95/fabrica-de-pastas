using System.ComponentModel;

namespace back.Enums;

public enum MetodoPago
{
    [Description("Efectivo")]
    Efectivo = 1,
    [Description("Mercado Pago")]
    MercadoPago = 2,
    [Description("Transferencia")]
    Transferencia = 3
}
