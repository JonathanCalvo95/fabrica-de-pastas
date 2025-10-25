import api from "./api";

export interface DashboardStatsDto {
  ventasDelMes: number;
  ventasDelMesChangePct?: number;

  productosActivos: number;
  productosActivosChange?: number;

  stockKg: number;
  stockUnidades: number;
  stockLitros: number;
  stockCajas: number;

  ticketPromedio: number;
  ticketPromedioChangePct?: number;
}

export interface RecentSaleDto {
  categoria: number;
  descripcion: string;
  cantidad: string;
  importe: number;
  fecha: string;
}

export interface LowStockDto {
  categoria: number;
  descripcion: string;
  medida: number;
  stock: string;
  stockMinimo: string;
}

export interface DashboardResponse {
  stats: DashboardStatsDto;
  recentSales: RecentSaleDto[];
  lowStock: LowStockDto[];
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
};
