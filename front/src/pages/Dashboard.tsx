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
  Stack,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  Inventory,
  ShoppingCart,
  ReceiptLong,
  TrendingUp,
  Payments,
  CalendarMonth,
  AccountBalanceWallet,
  ArrowDropUp,
  ArrowDropDown,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { theme } from "../theme/Theme";
import { getDashboard, type DashboardResponse } from "../api/dashboard";
import { formatName } from "../utils/formatters";
import { LineChart, BarChart, PieChart } from "@mui/x-charts";
import { metodoPagoLabel, MONTH, WEEK } from "../utils/enums";

/* ========= helpers ========= */
const money = (n: number) => `$${Number(n ?? 0).toLocaleString("es-AR")}`;
const pctStr = (n?: number) =>
  typeof n === "number" ? `${n >= 0 ? "+" : ""}${n.toFixed(1)}%` : undefined;
const getTrend = (n?: number) =>
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
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  const Icon = icon;
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            color: "primary.main",
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, ml: 0.5 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function KpiCard({
  title,
  value,
  change,
  icon,
  trend,
  description,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  trend: "up" | "down";
  description?: string;
}) {
  const Icon = icon;
  const isUp = trend === "up";
  const ChangeIcon = isUp ? ArrowDropUp : ArrowDropDown;

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
        transition: "all .18s ease-out",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          opacity: 0,
          background: (t) =>
            `linear-gradient(135deg, ${alpha(
              t.palette.primary.main,
              0.5
            )}, transparent 60%)`,
          transition: "opacity .18s ease-out",
          pointerEvents: "none",
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
        },
        "&:hover:before": {
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1, py: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ mt: 1, mb: 0.25, fontWeight: 700, lineHeight: 1.1 }}
            >
              {value}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {description}
              </Typography>
            )}
            {change && (
              <Chip
                size="small"
                icon={<ChangeIcon />}
                label={`${change} vs mes anterior`}
                sx={{
                  mt: 1,
                  pl: 0.5,
                  bgcolor: (t) =>
                    alpha(
                      isUp ? t.palette.success.main : t.palette.error.main,
                      0.08
                    ),
                  color: isUp ? "success.main" : "error.main",
                  fontWeight: 500,
                  borderRadius: 999,
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.16),
              color: "primary.main",
            }}
          >
            <Icon sx={{ fontSize: 30 }} />
          </Box>
        </Stack>
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
        title: "Ventas del mes",
        value: money(data.stats.ventasDelMes),
        change: pctStr(data.stats.ventasDelMesChangePct),
        icon: ShoppingCart,
        trend: getTrend(data.stats.ventasDelMesChangePct),
      },
      {
        title: "Productos activos",
        value: data.stats.productosActivos,
        change: undefined,
        icon: Inventory,
        trend: getTrend(data.stats.productosActivosChange),
        description: "en el catálogo",
      },
      {
        title: "Ticket promedio",
        value: money(data.stats.ticketPromedio),
        change: pctStr(data.stats.ticketPromedioChangePct),
        icon: ReceiptLong,
        trend: getTrend(data.stats.ticketPromedioChangePct),
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
    return data.cashClosures.slice(0, 5).map((c: any) => ({
      fecha: new Date(c.fecha).toLocaleDateString("es-AR"),
      apertura: money(Number(c.apertura ?? 0)),
      cierre: money(Number(c.cierre ?? 0)),
      diferencia: money(Number(c.diferencia ?? 0)),
      estado: c.estado,
    }));
  }, [data]);

  /* ======= estados especiales ======= */

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ maxWidth: 420, width: "100%" }}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 20px 55px rgba(15,23,42,0.16)",
            }}
          >
            <CardContent sx={{ py: 3 }}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp sx={{ fontSize: 30 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Preparando el dashboard…
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Estamos analizando los datos.
                  </Typography>
                  <LinearProgress
                    sx={{
                      mt: 2,
                      borderRadius: 999,
                      height: 6,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                      },
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );

  if (error)
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!data) return null;

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{ mb: 0.5, letterSpacing: -0.3, fontWeight: 700 }}
          >
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visión general de rendimiento.
          </Typography>
        </Box>
      </Box>

      {/* KPIs */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2.5,
          mb: 4,
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
            description={s.description}
          />
        ))}
      </Box>

      {/* Charts fila 1 */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ py: 2.5 }}>
          <SectionTitle
            icon={TrendingUp}
            title="Evolución mensual de ventas"
            subtitle="Comparación de ventas totales por mes."
          />
          <Divider sx={{ mb: 2.5 }} />
          <LineChart
            height={300}
            series={[
              {
                data: monthlyEvolution.map((m) => m.ventas),
                label: "Ventas ($)",
                color: theme.chartColors.ventasLine,
                curve: "monotoneX",
              },
            ]}
            xAxis={[
              { scaleType: "band", data: monthlyEvolution.map((m) => m.mes) },
            ]}
            grid={{ horizontal: true, vertical: false }}
          />
        </CardContent>
      </Card>

      {/* Charts fila 2 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 3,
          mb: 3,
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ py: 2.5 }}>
            <SectionTitle
              icon={CalendarMonth}
              title="Ventas por día"
              subtitle="Comportamiento de ventas en la última semana."
            />
            <Divider sx={{ mb: 2.5 }} />
            <BarChart
              height={260}
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

        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ py: 2.5 }}>
            <SectionTitle
              icon={Payments}
              title="Ingresos por método de pago"
              subtitle="Distribución de ingresos en los últimos 30 días."
            />
            <Divider sx={{ mb: 2.5 }} />
            <PieChart
              height={260}
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

      {/* Tablas lado a lado */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 3,
        }}
      >
        {/* Top productos */}
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ py: 2.5 }}>
            <SectionTitle
              icon={Inventory}
              title="Productos más vendidos"
              subtitle="Top productos por ingresos en el mes actual."
            />
            <Divider sx={{ mb: 1.5 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        PRODUCTO
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        CANTIDAD
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        INGRESOS
                      </Typography>
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
                            ? (t) => alpha(t.palette.primary.main, 0.04)
                            : "transparent",
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={index === 0 ? 600 : 500}
                        >
                          {item.product}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{item.cantidad}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color="primary"
                          fontWeight={600}
                        >
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

        {/* Cierres de caja */}
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ py: 2.5 }}>
            <SectionTitle
              icon={AccountBalanceWallet}
              title="Historial de cierres de caja"
              subtitle="Detalle de los últimos cierres registrados."
            />
            <Divider sx={{ mb: 1.5 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        FECHA
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        APERTURA
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        CIERRE
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        DIFERENCIA
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cashClosures.map((c) => (
                    <TableRow
                      key={c.fecha}
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2">{c.fecha}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{c.apertura}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {c.cierre}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={
                            c.diferencia.includes("-")
                              ? "error.main"
                              : "success.main"
                          }
                          fontWeight={600}
                        >
                          {c.diferencia}
                        </Typography>
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
    </Box>
  );
}
