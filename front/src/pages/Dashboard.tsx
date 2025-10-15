import { Box, Card, CardContent, Typography, Paper } from "@mui/material";
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  Warehouse,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { theme } from "../theme/Theme";

const stats = [
  {
    title: "Ventas del Mes",
    value: "$45,230",
    change: "+12.5%",
    icon: ShoppingCart,
    trend: "up",
  },
  {
    title: "Productos Activos",
    value: "28",
    change: "+3",
    icon: Inventory,
    trend: "up",
  },
  {
    title: "Stock Total",
    value: "1,247 kg",
    change: "-5%",
    icon: Warehouse,
    trend: "down",
  },
  {
    title: "Ganancia Neta",
    value: "$12,450",
    change: "+18%",
    icon: TrendingUp,
    trend: "up",
  },
];

const recentSales = [
  {
    id: 1,
    product: "Ravioles",
    quantity: "5 kg",
    amount: "$2,450",
    date: "Hoy",
  },
  { id: 2, product: "Ñoquis", quantity: "3 kg", amount: "$1,200", date: "Hoy" },
  {
    id: 3,
    product: "Tallarines",
    quantity: "10 kg",
    amount: "$3,800",
    date: "Ayer",
  },
  {
    id: 4,
    product: "Sorrentinos",
    quantity: "4 kg",
    amount: "$2,100",
    date: "Ayer",
  },
];

const lowStock = [
  { product: "Ravioles de Ricota", current: "12 kg", minimum: "50 kg" },
  { product: "Ñoquis de Papa", current: "8 kg", minimum: "30 kg" },
  { product: "Capeletis", current: "15 kg", minimum: "40 kg" },
];

export default function Dashboard() {
  return (
    <Box sx={{ p: 4 }}>
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentSales.map((sale) => (
                <Paper
                  key={sale.id}
                  sx={{
                    p: 2,
                    bgcolor: "action.hover",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography fontWeight={500}>{sale.product}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sale.quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography fontWeight={600} color="primary">
                      {sale.amount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sale.date}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 3 }}>
              Alerta de Stock Bajo
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {lowStock.map((item) => (
                <Paper
                  key={item.product}
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
                    {item.product}
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.primary">
                      Stock actual: <strong>{item.current}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Mínimo: <strong>{item.minimum}</strong>
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
