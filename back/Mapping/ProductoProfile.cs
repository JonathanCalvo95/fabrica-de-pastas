using AutoMapper;
using back.Entities;
using back.Domain;

namespace back.Mapping;

public class ProductoProfile : Profile
{
    public ProductoProfile()
    {
        CreateMap<Producto, Producto>();

        CreateMap<Producto, ProductoListItemDto>()
            .ForMember(d => d.Medida,
                opt => opt.MapFrom(s => s.Categoria.Defaults().medida))
            .ForMember(d => d.StockMinimo,
                opt => opt.MapFrom(s => s.Categoria.Defaults().min))
            .ForMember(d => d.StockMaximo,
                opt => opt.MapFrom(s => s.Categoria.Defaults().max))
            .ForMember(d => d.FechaCreacion,
                opt => opt.MapFrom(s => s.FechaCreacion.ToLocalTime().ToString("dd/MM/yyyy HH:mm")))
            .ForMember(d => d.FechaActualizacion,
                opt => opt.MapFrom(s => s.FechaActualizacion.ToLocalTime().ToString("dd/MM/yyyy HH:mm")));

        CreateMap<ProductoCreateUpdateDto, Producto>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.FechaCreacion, o => o.Ignore())
            .ForMember(d => d.FechaActualizacion, o => o.MapFrom(_ => DateTime.UtcNow));
    }
}
