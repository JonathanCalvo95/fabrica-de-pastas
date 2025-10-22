namespace back.Dtos.Productos;

public record ProductoListItemDto(
    string Id,
    string Nombre,
    string Descripcion,
    decimal Precio,
    int Medida,     // enum -> int
    double Stock,
    int Tipo,       // enum -> int
    bool Activo
);
