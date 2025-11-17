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

export interface VentaCreate {
  items: VentaItem[];
  metodoPago: number;
  observaciones?: string;
}
export interface VentaItem {
  productoId: string;
  cantidad: number;
}

export type VentaDetail = {
  id: string;
  fecha: string;
  total: number;
  metodoPago: MetodoPago;
  estado: EstadoVenta;
  cajaId?: string | null;
  observaciones?: string | null;
  cliente?: string | null;
  items: Array<{
    productoId: string;
    categoria: number;
    descripcion: string;
    medida?: number;
    cantidad: number;
    precioUnitario: number;
    subtotal?: number;
  }>;
};

export const getVenta = async (id: string) => {
  const { data } = await api.get<VentaDetail>(`/ventas/${id}`);
  return data;
};

export const getVentas = async (take = 50) => {
  const { data } = await api.get<VentaListItem[]>(`/ventas`, {
    params: { take },
  });
  return data;
};

export const crearVenta = async (body: VentaCreate) => {
  const { data } = await api.post(`/ventas`, body);
  return data;
};

export const anularVenta = async (id: string) => {
  const { data } = await api.post<VentaDetail>(`/ventas/${id}/anular`, {});
  return data;
};
