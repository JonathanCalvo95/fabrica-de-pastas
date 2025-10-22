using AutoMapper;
using back.Dtos.Productos;
using back.Entities;
using back.Enums;

namespace back.Mapping;

public class ProductoProfile : Profile
{
    public ProductoProfile()
    {
        CreateMap<Producto, ProductoListItemDto>()
            .ForCtorParam(nameof(ProductoListItemDto.Medida), opt => opt.MapFrom(p => (int)p.Medida))
            .ForCtorParam(nameof(ProductoListItemDto.Tipo), opt => opt.MapFrom(p => (int)p.Tipo));

        CreateMap<ProductoCreateUpdateDto, Producto>()
            .ForMember(p => p.Medida, opt => opt.MapFrom(d => (UnidadMedida)d.Medida))
            .ForMember(p => p.Tipo, opt => opt.MapFrom(d => (TipoProducto)d.Tipo));
    }
}
