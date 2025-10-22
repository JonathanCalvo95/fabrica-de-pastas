namespace back.Dtos.Productos;

public record ProductoCreateUpdateDto(
    string Nombre,
    string Descripcion,
    decimal Precio,
    int Medida,   // enum value
    double Stock,
    int Tipo,     // enum value
    bool Activo
);
