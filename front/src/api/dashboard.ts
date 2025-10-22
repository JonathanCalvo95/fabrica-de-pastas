import api from "./api";

export interface DashboardStatsDto {
  ventasDelMes: number;
  productosActivos: number;
  stockKg: number;
  stockUnidades: number;
  stockLitros: number;
  gananciaNeta: number;
}

export interface RecentSaleDto {
  producto: string;
  cantidad: string; // "5 kg"
  importe: number; // 2450
  fecha: string; // ISO
}

export interface LowStockDto {
  producto: string;
  actual: string; // "8 kg"
  minimo: string; // "10 kg"
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
