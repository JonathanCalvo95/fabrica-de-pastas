using back.Enums;

public class RegisterRequestDto
{
    public string Usuario { get; set; } = string.Empty;
    public string Clave { get; set; } = string.Empty;
    public TipoRol Rol { get; set; }
}