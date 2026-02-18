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
  stock: number;
  stockMinimo: number;
}

// Nuevos tipos
export interface MonthlyEvolutionPointDto {
  label: string;
  ventas: number;
  promedioDiario: number;
}

export interface SalesByWeekdayDto {
  label: string;
  ventas: number;
}

export interface PaymentMethodDto {
  metodo: string;
  importe: number;
}

export interface TopProductDto {
  categoria: string;
  descripcion: string;
  cantidad: number;
  ingresos: number;
  margenPct?: number | null;
}

export interface CashClosureDto {
  fecha: string;
  apertura: number;
  cierre: number;
  diferencia: number;
  estado: string;
}

export interface DashboardResponse {
  stats: DashboardStatsDto;
  recentSales: RecentSaleDto[];
  lowStock: LowStockDto[];
  monthlyEvolution: MonthlyEvolutionPointDto[];
  salesByWeekday: SalesByWeekdayDto[];
  paymentMethods: PaymentMethodDto[];
  topProducts: TopProductDto[];
  cashClosures: CashClosureDto[];
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
};
