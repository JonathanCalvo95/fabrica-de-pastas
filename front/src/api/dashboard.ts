import api from "./api";

export interface DashboardStatsDto {
  ventasDelMes: number;
  productosActivos: number;
  stockKg: number;
  stockUnidades: number;
  stockLitros: number;
  stockCajas: number;
  gananciaNeta: number;
}

export interface RecentSaleDto {
  producto: string;
  cantidad: string;
  importe: number;
  fecha: string;
}

export interface LowStockDto {
  producto: string;
  actual: string;
  minimo: string;
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
