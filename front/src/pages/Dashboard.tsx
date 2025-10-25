import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  Warehouse,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { theme } from "../theme/Theme";
import { getDashboard, type DashboardResponse } from "../api/dashboard";
import pluralizeEs from "pluralize-es";

type StatItem = {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getDashboard();
        setData(d);
      } catch (e: any) {
        setError(e?.response?.data ?? "No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats: StatItem[] = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Ventas del Mes",
        value: `$${data.stats.ventasDelMes.toLocaleString("es-AR")}`,
        change: undefined,
        icon: ShoppingCart,
        trend: "up",
      },
      {
        title: "Productos Activos",
        value: data.stats.productosActivos,
        change: undefined,
        icon: Inventory,
        trend: "up",
      },
      {
        title: "Stock Total",
        value: `${data.stats.stockCajas + pluralizeEs(" caja", data.stats.stockCajas)} / ${data.stats.stockKg.toLocaleString("es-AR")} kg / ${data.stats.stockUnidades} u / ${data.stats.stockLitros} l`,
        change: undefined,
        icon: Warehouse,
        trend: "down",
      },
      {
        title: "Ganancia Neta",
        value: `$${data.stats.gananciaNeta.toLocaleString("es-AR")}`,
        change: undefined,
        icon: TrendingUp,
        trend: "up",
      },
    ];
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Información general
        </Typography>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat) => (
          <Card
            key={stat.title}
            sx={{ "&:hover": { boxShadow: 6 }, cursor: "pointer" }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {stat.value}
                  </Typography>

                  {stat.change && (
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          stat.trend === "up" ? "success.main" : "error.main",
                        fontWeight: 600,
                      }}
                    >
                      {stat.change}
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
                  <stat.icon sx={{ color: "primary.main", fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Ventas Recientes */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 3 }}>
              Ventas Recientes
            </Typography>

            {data.recentSales.length === 0 ? (
              <Typography color="text.secondary">
                Sin ventas recientes.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {data.recentSales.map((sale, idx) => (
                  <Paper
                    key={idx}
                    sx={{
                      p: 2,
                      bgcolor: "action.hover",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={500}>{sale.producto}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sale.cantidad}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography fontWeight={600} color="primary">
                        ${sale.importe.toLocaleString("es-AR")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(sale.fecha).toLocaleDateString("es-AR")}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Alerta de Stock Bajo */}
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 3 }}>
              Alerta de Stock Bajo
            </Typography>

            {data.lowStock.length === 0 ? (
              <Typography color="text.secondary">
                Sin alertas de stock.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {data.lowStock.map((item, idx) => (
                  <Paper
                    key={idx}
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                      border: "1px solid",
                      borderColor: "error.main",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      fontWeight={500}
                      color="error.main"
                      sx={{ mb: 1 }}
                    >
                      {item.producto}
                    </Typography>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.primary">
                        Stock actual: <strong>{item.actual}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        Mínimo: <strong>{item.minimo}</strong>
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
