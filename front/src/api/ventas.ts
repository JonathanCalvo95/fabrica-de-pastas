import api from "./api";

export type MetodoPago = 1 | 2 | 3; // Cash, MP, Transfer
export type EstadoVenta = 1 | 2 | 3; // Confirmada, Anulada, Devuelta

export type VentaListItem = {
  id: string;
  fecha: string;
  items: number;
  total: number;
  metodoPago: MetodoPago;
  estado: EstadoVenta;
};

export interface VentaCreateItem {
  productoId: string;
  cantidad: number;
}
export interface VentaCreate {
  productos: VentaCreateItem[];
  metodoPago: number;
  observaciones?: string;
}

export const getVentas = async (take = 50) => {
  const { data } = await api.get<VentaListItem[]>(`/ventas`, {
    params: { take },
  });
  return data;
};

export const getVenta = async (id: string) => {
  const { data } = await api.get(`/ventas/${id}`);
  return data;
};

export const crearVenta = async (body: VentaCreate) => {
  const { data } = await api.post(`/ventas`, body);
  return data;
};
