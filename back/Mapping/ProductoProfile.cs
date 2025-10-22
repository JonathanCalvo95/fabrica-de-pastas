using AutoMapper;
using back.Entities;

namespace back.Mapping;

public class ProductoProfile : Profile
{
    public ProductoProfile()
    {
        CreateMap<Producto, Producto>();

        CreateMap<Producto, ProductoListItemDto>();

        CreateMap<ProductoCreateUpdateDto, Producto>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.FechaCreacion, o => o.Ignore())
            .ForMember(d => d.FechaActualizacion, o => o.MapFrom(_ => DateTime.UtcNow));
    }
}
