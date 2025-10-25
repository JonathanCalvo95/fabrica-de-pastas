import api from "./api";

export type EstadoCaja = 1 | 2 | 3; // 1=Abierta, 2=Cerrada, 3=Pausada

export interface CajaDto {
  id: string;
  apertura: string; // ISO
  cierre: string | null;
  montoInicial: number;
  montoCalculado: number | null;
  montoReal: number | null;
  usuarioId: string;
  estado: EstadoCaja;
  observaciones: string;
}

// ✅ GET /api/caja/current  -> 200 con CajaDto | 204 sin caja
export async function getCajaActual(): Promise<CajaDto | null> {
  const res = await api.get<CajaDto>("/caja/current", {
    validateStatus: () => true,
  });
  return res.status === 200 ? res.data : null;
}

// (opcional) historial y acciones si ya los usás
export async function getHistorialCaja(take = 50): Promise<CajaDto[]> {
  const { data } = await api.get<CajaDto[]>(`/caja?take=${take}`);
  return data;
}

export async function getVentasEfectivo(): Promise<number> {
  const { data } = await api.get<number>("/caja/cash-sales");
  return data;
}

export async function abrirCaja(monto: number) {
  const { data } = await api.post<CajaDto>("/caja/open", {
    monto,
  });
  return data;
}

export async function cerrarCaja(params: {
  monto: number;
  observaciones?: string;
}) {
  await api.post("/caja/close", params);
}
