using back.Enums;

namespace back.Dtos.Usuarios;

public class UsuarioUpdateDto
{
    public string? Nombre { get; set; }
    public string? NuevaClave { get; set; }
    public TipoRol? Rol { get; set; }
    public bool? Activo { get; set; }
}
