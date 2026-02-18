using back.Enums;
using back.Entities;
using System.ComponentModel.DataAnnotations;

namespace back.Dtos.Pedidos;

public class PedidoCreateDto
{
    public List<PedidoCreateItemDto> Items { get; set; } = [];
    
    [Required(ErrorMessage = "El nombre del cliente es obligatorio")]
    public string Cliente { get; set; } = string.Empty;
    
    public string? Observaciones { get; set; }
}

public class PedidoCreateItemDto
{
    public string ProductoId { get; set; } = string.Empty;
    public double Cantidad { get; set; }
}

public class PedidoListItemDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string? Cliente { get; set; }
    public EstadoPedido Estado { get; set; }
    public decimal Total { get; set; }
    public string? UsuarioId { get; set; }
    public string? VentaId { get; set; }
}

public class PedidoDetailDto
{
    public string Id { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string? Cliente { get; set; }
    public string? Observaciones { get; set; }
    public EstadoPedido Estado { get; set; }
    public string? VentaId { get; set; }
    public string? UsuarioId { get; set; }
    public List<PedidoItemDto> Items { get; set; } = [];
    public decimal Total { get; set; }
}

public class PedidoItemDto
{
    public string ProductoId { get; set; } = string.Empty;
    public Categoria? Categoria { get; set; }
    public Medida? Medida { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public double Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}

public class PedidoEstadoUpdateDto
{
    public EstadoPedido Estado { get; set; }
}

public class GenerarVentaDesdePedidoDto
{
    public MetodoPago MetodoPago { get; set; }
}
