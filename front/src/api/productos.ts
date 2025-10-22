import api from "./api";

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  medida: number; // enum
  stock: number;
  tipo: number;   // enum
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export const getProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get<Producto[]>("/Productos");
  return data;
};

export const postProducto = async (body: Partial<Producto>) => {
  const { data } = await api.post<Producto>("/Productos", body);
  return data;
};

export const putProducto = async (id: string, body: Partial<Producto>) => {
  await api.put(`/Productos/${id}`, body);
};

export const delProducto = async (id: string) => {
  await api.delete(`/Productos/${id}`);
};
