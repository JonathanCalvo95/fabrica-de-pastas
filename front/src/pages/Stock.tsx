import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
} from "@mui/material";
import { Warning, TrendingDown, TrendingUp } from "@mui/icons-material";

const stockItems = [
  {
    id: 1,
    name: "Ravioles de Ricota",
    current: 45,
    minimum: 50,
    maximum: 150,
    unit: "kg",
    lastUpdate: "Hoy, 10:30",
    movement: "out",
  },
  {
    id: 2,
    name: "Ñoquis de Papa",
    current: 8,
    minimum: 30,
    maximum: 100,
    unit: "kg",
    lastUpdate: "Hoy, 09:15",
    movement: "out",
  },
  {
    id: 3,
    name: "Tallarines al Huevo",
    current: 67,
    minimum: 40,
    maximum: 120,
    unit: "kg",
    lastUpdate: "Ayer, 16:45",
    movement: "in",
  },
  {
    id: 4,
    name: "Sorrentinos de Jamón y Queso",
    current: 34,
    minimum: 35,
    maximum: 100,
    unit: "kg",
    lastUpdate: "Hoy, 08:20",
    movement: "out",
  },
  {
    id: 5,
    name: "Capeletis de Verdura",
    current: 15,
    minimum: 40,
    maximum: 110,
    unit: "kg",
    lastUpdate: "Ayer, 18:00",
    movement: "out",
  },
  {
    id: 6,
    name: "Lasagna",
    current: 23,
    minimum: 20,
    maximum: 60,
    unit: "unidad",
    lastUpdate: "Hoy, 11:00",
    movement: "in",
  },
];

const getStockColor = (current: number, minimum: number) => {
  if (current < minimum) return "error";
  if (current < minimum * 1.5) return "warning";
  return "success";
};

export default function Stock() {
  const criticalItems = stockItems.filter(
    (item) => item.current < item.minimum
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>
          Control de Stock
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitorea el inventario de tus productos
        </Typography>
      </Box>

      {criticalItems.length > 0 && (
        <Alert severity="error" icon={<Warning />} sx={{ mb: 4 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Alerta: {criticalItems.length} producto(s) bajo mínimo
          </Typography>
          <Typography variant="body2">
            Los siguientes productos requieren reposición urgente:{" "}
            {criticalItems.map((item) => item.name).join(", ")}
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        {stockItems.map((item) => {
          const percentage = (item.current / item.maximum) * 100;
          const stockColor = getStockColor(item.current, item.minimum);

          return (
            <Card key={item.id} sx={{ "&:hover": { boxShadow: 6 } }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Última actualización: {item.lastUpdate}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {item.movement === "in" ? (
                      <TrendingUp color="success" />
                    ) : (
                      <TrendingDown color="error" />
                    )}
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={`${stockColor}.main`}
                    >
                      {item.current} {item.unit}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Mínimo: {item.minimum} {item.unit}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Máximo: {item.maximum} {item.unit}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    color={stockColor}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="outlined" size="small" fullWidth>
                    Agregar Stock
                  </Button>
                  <Button variant="outlined" size="small" fullWidth>
                    Ajustar Mínimos
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Stock Total
            </Typography>
            <Typography variant="h3">1,247 kg</Typography>
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              -5% vs. mes anterior
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Productos Críticos
            </Typography>
            <Typography variant="h3" color="error.main">
              {criticalItems.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Requieren atención
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Valor del Inventario
            </Typography>
            <Typography variant="h3" color="primary">
              $487,650
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
