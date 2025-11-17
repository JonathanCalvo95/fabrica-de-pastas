import api from "./api";

export type EstadoPedido = 1 | 2 | 3 | 4; // Pendiente, Confirmado, Entregado, Cancelado
export type MetodoPago = 1 | 2 | 3; // match ventas

export interface PedidoItemDto {
  productoId: string;
  categoria?: number;
  medida?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoListItem {
  id: string;
  fecha: string;
  cliente?: string;
  estado: EstadoPedido;
  total: number;
  usuarioId?: string;
}

export interface PedidoDetail extends PedidoListItem {
  observaciones?: string;
  ventaId?: string;
  usuarioId?: string;
  items: PedidoItemDto[];
}

export interface PedidoCreate {
  items: { productoId: string; cantidad: number }[];
  cliente?: string;
  observaciones?: string;
}

export const list = async (estados?: EstadoPedido[]): Promise<PedidoListItem[]> => {
  const params = estados && estados.length ? { estados } : undefined;
  const { data } = await api.get<PedidoListItem[]>("/Pedidos", { params });
  return data;
};

export const get = async (id: string): Promise<PedidoDetail> => {
  const { data } = await api.get<PedidoDetail>(`/Pedidos/${id}`);
  return data;
};

export const create = async (body: PedidoCreate): Promise<PedidoDetail> => {
  const { data } = await api.post<PedidoDetail>("/Pedidos", body);
  return data;
};

export const updateEstado = async (id: string, estado: EstadoPedido): Promise<PedidoDetail> => {
  const { data } = await api.post<PedidoDetail>(`/Pedidos/${id}/estado`, { estado });
  return data;
};

export const generarVenta = async (
  id: string,
  metodoPago: MetodoPago
): Promise<{ ventaId: string; pedidoId: string }> => {
  const { data } = await api.post<{ ventaId: string; pedidoId: string }>(`/Pedidos/${id}/generar-venta`, { metodoPago });
  return data;
};
