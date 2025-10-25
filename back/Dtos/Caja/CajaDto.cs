using back.Enums;

public class CajaDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Apertura { get; set; }
    public DateTime? Cierre { get; set; }
    public decimal MontoInicial { get; set; }
    public decimal? MontoCalculado { get; set; }
    public decimal? MontoReal { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public EstadoCaja Estado { get; set; }
    public string Observaciones { get; set; } = string.Empty;
}