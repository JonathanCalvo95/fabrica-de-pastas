import api from "./api";

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  medida: number; // enum Medida
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  categoria: number; // enum Categoria
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export const get = async (): Promise<Producto[]> => {
  const { data } = await api.get<Producto[]>("/Productos");
  return data;
};

export const post = async (body: Partial<Producto>) => {
  const { data } = await api.post<Producto>("/Productos", body);
  return data;
};

export const put = async (id: string, body: Partial<Producto>) => {
  await api.put(`/Productos/${id}`, body);
};

export const del = async (id: string) => {
  await api.delete(`/Productos/${id}`);
};

export async function updateStock(id: string, newStock: number): Promise<void> {
  const current = await api
    .get<Producto>(`/Productos/${id}`)
    .then((r) => r.data);
  const body: Producto = { ...current, stock: newStock };
  await api.put(`/Productos/${id}`, body);
}
