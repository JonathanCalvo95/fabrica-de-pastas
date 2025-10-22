import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Warning, TrendingDown, TrendingUp } from "@mui/icons-material";
import { get, updateStock, type Producto } from "../api/productos";

type Movement = "in" | "out";

interface StockItem {
  id: string;
  name: string;
  current: number;
  minimum: number;
  maximum: number;
  unit: string;
  lastUpdate: string;
  movement: Movement;
}

// Helpers
const unidadLabel = (u: number) =>
  ({ 0: "kg", 1: "unidad", 2: "litro" })[u] ?? String(u);

// Mapea Producto (back) → StockItem (UI)
function mapProductoToStockItem(p: Producto): StockItem {
  return {
    id: p.id,
    name: p.nombre,
    current: p.stock,
    minimum: p.stockMinimo,
    maximum: p.stockMaximo,
    unit: unidadLabel(p.medida),
    lastUpdate: "—",
    movement: "in",
  };
}

const getStockColor = (current: number, minimum: number) => {
  if (current < minimum) return "error";
  if (current < minimum * 1.5) return "warning";
  return "success";
};

export default function Stock() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [openStock, setOpenStock] = useState(false);
  const [openMinStock, setOpenMinStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [stockAmount, setStockAmount] = useState(0);
  const [minStockAmount, setMinStockAmount] = useState(0);
  const [maxStockAmount, setMaxStockAmount] = useState(0);

  // Cargar desde el backend
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const productos = await get();
        setStockItems(productos.map(mapProductoToStockItem));
        setLoadError(null);
      } catch (e) {
        setLoadError("No se pudo cargar el stock.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const criticalItems = stockItems.filter(
    (item) => item.current < item.minimum
  );

  const handleOpenStock = (item: StockItem) => {
    setSelectedItem(item);
    setStockAmount(0);
    setOpenStock(true);
  };

  const handleOpenMinStock = (item: StockItem) => {
    setSelectedItem(item);
    setMinStockAmount(item.minimum);
    setMaxStockAmount(item.maximum);
    setOpenMinStock(true);
  };

  const handleAddStock = async () => {
    if (!selectedItem) return;

    const newStock = selectedItem.current + stockAmount;
    try {
      await updateStock(selectedItem.id, newStock);

      setStockItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? {
                ...it,
                current: newStock,
                lastUpdate: "Ahora",
                movement: stockAmount >= 0 ? "in" : "out",
              }
            : it
        )
      );
      setOpenStock(false);
    } catch {
      alert("No se pudo actualizar el stock.");
    }
  };

  // Ajustar mínimos en UI (mientras no existan en el back)
  const handleUpdateMinStock = () => {
    if (!selectedItem) return;
    setStockItems((prev) =>
      prev.map((it) =>
        it.id === selectedItem.id
          ? { ...it, minimum: minStockAmount, maximum: maxStockAmount }
          : it
      )
    );
    setOpenMinStock(false);

    // Cuando tengas min/max en el back, llamá:
    // await updateProductoMinMax(selectedItem.id, minStockAmount, maxStockAmount);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Cargando stock…</Typography>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
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
          const percentage = Math.min(100, (item.current / item.maximum) * 100);
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
                    color={stockColor as any}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenStock(item)}
                  >
                    Agregar Stock
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenMinStock(item)}
                  >
                    Ajustar Mínimos
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* KPIs (placeholder con datos locales) */}
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
            <Typography variant="h3">
              {stockItems.reduce(
                (acc, it) => acc + (it.unit === "kg" ? it.current : 0),
                0
              )}{" "}
              kg
            </Typography>
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              — vs. mes anterior
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
              — {/* cuando tengas costo/precio x stock, calculás acá */}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Dialog Agregar Stock */}
      <Dialog
        open={openStock}
        onClose={() => setOpenStock(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Agregar Stock</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedItem?.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Stock actual:{" "}
            <strong>
              {selectedItem?.current} {selectedItem?.unit}
            </strong>
          </Typography>
          <TextField
            label="Cantidad a agregar"
            type="number"
            value={stockAmount}
            onChange={(e) => setStockAmount(Number(e.target.value))}
            fullWidth
            autoFocus
            sx={{ mt: 2 }}
          />
          {stockAmount > 0 && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              Nuevo stock: {(selectedItem?.current || 0) + stockAmount}{" "}
              {selectedItem?.unit}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStock(false)}>Cancelar</Button>
          <Button
            onClick={handleAddStock}
            variant="contained"
            disabled={stockAmount <= 0}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Ajustar Mínimos */}
      <Dialog
        open={openMinStock}
        onClose={() => setOpenMinStock(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Ajustar Stock Mínimo y Máximo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedItem?.name}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Stock mínimo"
              type="number"
              value={minStockAmount}
              onChange={(e) => setMinStockAmount(Number(e.target.value))}
              fullWidth
              helperText={`Actual: ${selectedItem?.minimum} ${selectedItem?.unit}`}
            />
            <TextField
              label="Stock máximo"
              type="number"
              value={maxStockAmount}
              onChange={(e) => setMaxStockAmount(Number(e.target.value))}
              fullWidth
              helperText={`Actual: ${selectedItem?.maximum} ${selectedItem?.unit}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMinStock(false)}>Cancelar</Button>
          <Button onClick={handleUpdateMinStock} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
