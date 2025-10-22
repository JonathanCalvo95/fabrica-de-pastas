using back.Enums;

public class CajaDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Apertura { get; set; }
    public DateTime? Cierre { get; set; }
    public decimal MontoApertura { get; set; }
    public decimal? MontoCierreCalculado { get; set; }
    public decimal? MontoCierreReal { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public EstadoCaja Estado { get; set; }
    public string Observaciones { get; set; } = string.Empty;
}