using FabricaDePastas.Back.Entities;

namespace FabricaDePastas.Back.Data;

public interface IProductoRepo
{
    IEnumerable<Producto> GetAll();
    Producto? GetById(string id);
    Producto Add(Producto p);
    bool Update(string id, Producto p);
    bool Delete(string id);
}
