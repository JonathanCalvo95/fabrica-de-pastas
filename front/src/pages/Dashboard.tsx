import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  Inventory,
  ShoppingCart,
  ReceiptLong,
  TrendingUp,
  Payments,
  CalendarMonth,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { theme } from "../theme/Theme";
import { getDashboard, type DashboardResponse } from "../api/dashboard";
import { formatName } from "../utils/formatters";
import { LineChart, BarChart, PieChart } from "@mui/x-charts";
import { metodoPagoLabel } from "../utils/enums";

/* ========= helpers ========= */
const MONTH = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const money = (n: number) => `$${Number(n ?? 0).toLocaleString("es-AR")}`;
const pctStr = (n?: number) =>
  typeof n === "number" ? `${n >= 0 ? "+" : ""}${n.toFixed(1)}%` : undefined;
const trend = (n?: number) =>
  (Number(n ?? 0) >= 0 ? "up" : "down") as "up" | "down";

/* ========= data hook ========= */
function useDashboard() {
  const [state, set] = useState<{
    data: DashboardResponse | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getDashboard();
        if (alive) set({ data, loading: false, error: null });
      } catch (e: any) {
        if (alive)
          set({
            data: null,
            loading: false,
            error: e?.response?.data ?? "No se pudo cargar el dashboard",
          });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

/* ========= UI atoms ========= */
function SectionTitle({
  icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const Icon = icon;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
      <Icon sx={{ color: "primary.main" }} />
      <Typography variant="h3">{children}</Typography>
    </Box>
  );
}

function KpiCard({
  title,
  value,
  change,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  trend: "up" | "down";
}) {
  const Icon = icon;
  return (
    <Card sx={{ "&:hover": { boxShadow: 6 }, cursor: "pointer" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {change && (
              <Typography
                variant="body2"
                sx={{
                  color: trend === "up" ? "success.main" : "error.main",
                  fontWeight: 600,
                }}
              >
                {change}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: "primary.main", fontSize: 28 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ========= main ========= */
export default function Dashboard() {
  const { data, loading, error } = useDashboard();

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Ventas del Mes",
        value: money(data.stats.ventasDelMes),
        change: pctStr(data.stats.ventasDelMesChangePct),
        icon: ShoppingCart,
        trend: trend(data.stats.ventasDelMesChangePct),
      },
      {
        title: "Productos Activos",
        value: data.stats.productosActivos,
        change:
          typeof data.stats.productosActivosChange === "number"
            ? `${data.stats.productosActivosChange >= 0 ? "+" : ""}${data.stats.productosActivosChange}`
            : undefined,
        icon: Inventory,
        trend: trend(data.stats.productosActivosChange),
      },
      {
        title: "Ticket Promedio",
        value: money(data.stats.ticketPromedio),
        change: pctStr(data.stats.ticketPromedioChangePct),
        icon: ReceiptLong,
        trend: trend(data.stats.ticketPromedioChangePct),
      },
    ] as const;
  }, [data]);

  const monthlyEvolution = useMemo(() => {
    if (data?.monthlyEvolution?.length) {
      return data.monthlyEvolution.map((m: any) => ({
        mes: m.label ?? m.mes ?? m.month ?? "",
        ventas: Number(m.ventas ?? 0),
        promedio: Number(m.promedioDiario ?? m.promedio ?? 0),
      }));
    }
    const sales = data?.recentSales ?? [];
    if (!sales.length) return [];
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        year: d.getFullYear(),
        month: d.getMonth(),
        ventas: 0,
      };
    });
    const map = new Map(buckets.map((b) => [b.key, b]));
    for (const s of sales as any[]) {
      const dt = new Date(s.fecha ?? s.date ?? Date.now());
      const k = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (map.has(k)) map.get(k)!.ventas += Number(s.importe ?? s.total ?? 0);
    }
    return buckets.map((b) => {
      const ventas = map.get(b.key)?.ventas ?? 0;
      const days = new Date(b.year, b.month + 1, 0).getDate();
      return {
        mes: MONTH[b.month],
        ventas,
        promedio: Math.round(ventas / days),
      };
    });
  }, [data]);

  const salesByDay = useMemo(() => {
    if (data?.salesByWeekday?.length) {
      return data.salesByWeekday.map((d: any) => ({
        dia: d.label ?? d.dia ?? "",
        ventas: Number(d.ventas ?? 0),
      }));
    }
    const sales = data?.recentSales ?? [];
    if (!sales.length) return [];
    const acc = new Array(7).fill(0);
    for (const s of sales as any[]) {
      const dt = new Date(s.fecha ?? s.date ?? Date.now());
      acc[dt.getDay()] += Number(s.importe ?? s.total ?? 0);
    }
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.map((i) => ({ dia: WEEK[i], ventas: acc[i] }));
  }, [data]);

  const paymentMethods = useMemo(() => {
    const normalize = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "");
    const colorFor = (raw: string) => {
      const n = normalize(raw);
      if (n === "efectivo") return theme.chartColors.pagoEfectivo;
      if (n === "transferencia") return theme.chartColors.pagoTransferencia;
      if (n === "mercadopago") return theme.chartColors.pagoMercadoPago;
      return theme.chartColors.pagoFallback;
    };

    if (data?.paymentMethods?.length) {
      return data.paymentMethods.map((pm: any) => {
        const raw = pm.metodo ?? pm.name;
        const label =
          typeof raw === "number" ? metodoPagoLabel(raw) : String(raw ?? "");
        return {
          name: label,
          value: Number(pm.importe ?? pm.total ?? 0),
          color: colorFor(label),
        };
      });
    }

    const sales = data?.recentSales ?? [];
    if (!sales.length) return [];
    const map = new Map<string, number>();
    for (const s of sales as any[]) {
      const raw = (s.metodoPago ??
        s.medioPago ??
        s.formaPago ??
        "Desconocido") as any;
      const label =
        typeof raw === "number" ? metodoPagoLabel(raw) : String(raw ?? "");
      const val = Number(s.importe ?? s.total ?? 0);
      map.set(label, (map.get(label) ?? 0) + val);
    }
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      color: colorFor(name),
    }));
  }, [data]);

  const topProducts = useMemo(() => {
    if (data?.topProducts?.length) {
      return data.topProducts.map((p: any) => ({
        product: formatName(p.categoria, p.descripcion),
        cantidad: `${p.cantidad ?? 0} ${p.unidad ?? ""}`.trim(),
        ingresos: money(Number(p.ingresos ?? 0)),
      }));
    }
    const sales = data?.recentSales ?? [];
    if (!sales.length) return [];
    const map = new Map<
      string,
      { product: string; cantidad: number; ingresos: number }
    >();
    for (const s of sales as any[]) {
      const key = `${s.categoria ?? ""} - ${s.descripcion ?? ""}`;
      const curr = map.get(key) ?? {
        product: formatName(s.categoria, s.descripcion),
        cantidad: 0,
        ingresos: 0,
      };
      curr.cantidad += Number(s.cantidad ?? 0);
      curr.ingresos += Number(s.importe ?? s.total ?? 0);
      map.set(key, curr);
    }
    return Array.from(map.values())
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 5)
      .map(({ product, cantidad, ingresos }) => ({
        product,
        cantidad: `${cantidad}`,
        ingresos: money(ingresos),
      }));
  }, [data]);

  const cashClosures = useMemo(() => {
    if (!data?.cashClosures?.length) return [];
    return data.cashClosures.map((c: any) => ({
      fecha: new Date(c.fecha).toLocaleDateString("es-AR"),
      apertura: money(Number(c.apertura ?? 0)),
      cierre: money(Number(c.cierre ?? 0)),
      diferencia: money(Number(c.diferencia ?? 0)),
      estado: c.estado,
    }));
  }, [data]);

  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Cargando dashboard…</Typography>
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (!data) return null;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análisis del negocio
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
          mb: 2,
        }}
      >
        {stats.map((s) => (
          <KpiCard
            key={String(s.title)}
            title={s.title}
            value={s.value}
            change={s.change}
            icon={s.icon}
            trend={s.trend}
          />
        ))}
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <SectionTitle icon={TrendingUp}>
            Evolución de Ventas Mensual (Últimos meses)
          </SectionTitle>
          <LineChart
            height={300}
            series={[
              {
                data: monthlyEvolution.map((m) => m.ventas),
                label: "Ventas ($)",
                color: theme.chartColors.ventasLine,
                curve: "monotoneX",
              },
              {
                data: monthlyEvolution.map((m) => m.promedio),
                label: "Promedio diario ($)",
                color: theme.chartColors.promedioLine,
                showMark: false,
              },
            ]}
            xAxis={[
              { scaleType: "band", data: monthlyEvolution.map((m) => m.mes) },
            ]}
            grid={{ horizontal: true, vertical: false }}
          />
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <SectionTitle icon={CalendarMonth}>
              Ventas por Día (Última semana)
            </SectionTitle>
            <BarChart
              height={280}
              series={[
                {
                  data: salesByDay.map((d) => d.ventas),
                  label: "Ventas ($)",
                  color: theme.chartColors.barVentas,
                },
              ]}
              xAxis={[
                { data: salesByDay.map((d) => d.dia), scaleType: "band" },
              ]}
              yAxis={[{ label: "Ventas" }]}
              grid={{ horizontal: true }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <SectionTitle icon={Payments}>
              Ingresos por Método de Pago (Últimos 30 días)
            </SectionTitle>
            <PieChart
              height={300}
              series={[
                {
                  data: paymentMethods.map((pm, i) => ({
                    id: i,
                    value: pm.value,
                    label: pm.name,
                    color: pm.color,
                  })),
                  outerRadius: 100,
                  paddingAngle: 2,
                  arcLabel: (item) => {
                    const total = paymentMethods.reduce(
                      (acc, p) => acc + p.value,
                      0
                    );
                    const pct = total
                      ? Math.round((item.value / total) * 100)
                      : 0;
                    return `${pct}%`;
                  },
                  arcLabelMinAngle: 10,
                },
              ]}
            />
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <SectionTitle icon={Inventory}>
            Productos Más Vendidos (Mes actual)
          </SectionTitle>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Producto</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Cantidad</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Ingresos</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topProducts.map((item, index) => (
                  <TableRow
                    key={item.product + index}
                    sx={{
                      "&:hover": { bgcolor: "action.hover" },
                      bgcolor:
                        index === 0
                          ? alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={index === 0 ? 600 : 400}>
                        {item.product}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{item.cantidad}</TableCell>
                    <TableCell align="right">
                      <Typography color="primary" fontWeight={500}>
                        {item.ingresos}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {topProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color="text.secondary">
                        Sin datos disponibles.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle icon={AccountBalanceWallet}>
            Historial de Cierres de Caja (Recientes)
          </SectionTitle>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Fecha</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Apertura</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Cierre</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Diferencia</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Estado</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cashClosures.map((c) => (
                  <TableRow
                    key={c.fecha}
                    sx={{ "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <TableCell>{c.fecha}</TableCell>
                    <TableCell align="right">{c.apertura}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={500}>{c.cierre}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="success.main" fontWeight={600}>
                        {c.diferencia}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={c.estado === "ok" ? "OK" : "Diferencia"}
                        size="small"
                        color={c.estado === "ok" ? "success" : "warning"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {cashClosures.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        Sin historial disponible.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
