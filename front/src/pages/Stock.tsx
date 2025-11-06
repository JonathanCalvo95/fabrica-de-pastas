import { useEffect, useState, useRef } from "react";
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
  Chip,
} from "@mui/material";
import { Warning, TrendingDown, TrendingUp } from "@mui/icons-material";
import { get, updateStock, type Producto } from "../api/productos";
import { medidaLabel, categoriaLabel } from "../utils/enums";
import { pluralAuto } from "../utils/plural";
import { formatName } from "../utils/formatters";

const getStockColor = (current: number, minimum: number) => {
  if (current < minimum) return "error";
  if (current < minimum * 1.5) return "warning";
  return "success";
};

const money = (v: number) =>
  v.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

export default function Stock() {
  const [stockItems, setStockItems] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // diálogos
  const [openAdd, setOpenAdd] = useState(false);
  const [openReduce, setOpenReduce] = useState(false);

  const [selectedItem, setSelectedItem] = useState<Producto | null>(null);
  const [addAmount, setAddAmount] = useState<number | "">("");
  const [reduceAmount, setReduceAmount] = useState<number | "">("");

  const addInputRef = useRef<HTMLInputElement>(null);
  const reduceInputRef = useRef<HTMLInputElement>(null);

  // Cargar desde el backend
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const productos = await get();
        setStockItems(productos);
        setLoadError(null);
      } catch {
        setLoadError("No se pudo cargar el stock.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reload = async () => {
    const productos = await get();
    setStockItems(productos);
  };

  const criticalItems = stockItems.filter((i) => i.stock < i.stockMinimo);
  const healthyItems = stockItems.filter(
    (i) => i.stock >= i.stockMinimo && i.stock <= i.stockMaximo
  );
  const healthPct =
    stockItems.length === 0
      ? 0
      : Math.round((healthyItems.length / stockItems.length) * 100);

  // Valor del inventario (precio * stock)
  const inventoryValue = stockItems.reduce(
    (acc, it) => acc + (Number(it.precio) || 0) * (Number(it.stock) || 0),
    0
  );

  // Abrir diálogos
  const handleOpenAdd = (item: Producto) => {
    setSelectedItem(item);
    setAddAmount("");
    setOpenAdd(true);

    setTimeout(() => {
      addInputRef.current?.focus();
    }, 100);
  };

  const handleOpenReduce = (item: Producto) => {
    setSelectedItem(item);
    setReduceAmount("");
    setOpenReduce(true);

    setTimeout(() => {
      reduceInputRef.current?.focus();
    }, 100);
  };

  // Acciones
  const handleAddStock = async () => {
    if (!selectedItem || addAmount === "") return;
    const newStock = selectedItem.stock + Number(addAmount);
    try {
      await updateStock(selectedItem.id, newStock);
      await reload();
      setOpenAdd(false);
    } catch {
      alert("No se pudo actualizar el stock.");
    }
  };

  const handleReduceStock = async () => {
    if (!selectedItem || reduceAmount === "") return;
    const qty = Math.max(0, Number(reduceAmount));
    const newStock = Math.max(0, selectedItem.stock - qty);
    try {
      await updateStock(selectedItem.id, newStock);
      await reload();
      setOpenReduce(false);
    } catch {
      alert("No se pudo actualizar el stock.");
    }
  };

  // UI estados
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Control de Stock
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitorea el inventario de tus productos
        </Typography>
      </Box>

      {/* Alerta */}
      {criticalItems.length > 0 && (
        <Alert severity="error" icon={<Warning />} sx={{ mb: 4 }}>
          <Typography fontWeight={600}>
            Alerta: {criticalItems.length} producto(s) bajo mínimo
          </Typography>
        </Alert>
      )}

      {/* KPIs */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Salud del Inventario
            </Typography>
            <Typography variant="h3" color="success.main" fontWeight={700}>
              {healthPct}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {healthyItems.length} de {stockItems.length} productos entre
              mínimo y máximo
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Productos Críticos
            </Typography>
            <Typography variant="h3" color="error.main" fontWeight={700}>
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
            <Typography variant="h3" color="primary.main" fontWeight={700}>
              {money(inventoryValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Estimado (precio × stock)
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stockItems.map((item) => {
          const max = Math.max(1, item.stockMaximo ?? 1);
          const percentage = Math.min(100, (item.stock / max) * 100);
          const stockColor = getStockColor(item.stock, item.stockMinimo);

          return (
            <Card key={item.id} sx={{ "&:hover": { boxShadow: 6 } }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                      {categoriaLabel(item.categoria)}
                    </Typography>
                    <Chip
                      label={item.descripcion}
                      size="small"
                      sx={{ bgcolor: "primary.light" }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {item.stock >= item.stockMinimo ? (
                      <TrendingUp color="success" />
                    ) : (
                      <TrendingDown color="error" />
                    )}
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color={`${stockColor}.main`}
                    >
                      {item.stock}{" "}
                      {pluralAuto(medidaLabel(item.medida), item.stock)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Última actualización: {item.fechaActualizacion}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Mínimo: {item.stockMinimo}{" "}
                      {pluralAuto(medidaLabel(item.medida), item.stockMinimo)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Máximo: {item.stockMaximo}{" "}
                      {pluralAuto(medidaLabel(item.medida), item.stockMaximo)}
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
                    onClick={() => handleOpenAdd(item)}
                  >
                    Agregar Stock
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenReduce(item)}
                  >
                    Reducir Stock
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Dialog Agregar Stock */}
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Agregar Stock</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {formatName(selectedItem?.categoria, selectedItem?.descripcion)}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Stock actual: <strong>{selectedItem?.stock}</strong>
          </Typography>
          <TextField
            label="Cantidad a agregar"
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value === "" ? "" : Number(e.target.value))}
            fullWidth
            inputRef={addInputRef}
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && addAmount !== "" && addAmount > 0) {
                handleAddStock();
              }
            }}
          />
          {Number(addAmount) > 0 && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              Nuevo stock: {(selectedItem?.stock || 0) + Number(addAmount)}{" "}
              {pluralAuto(
                medidaLabel(selectedItem?.medida),
                (selectedItem?.stock || 0) + Number(addAmount)
              )}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAddStock}
            disabled={addAmount === "" || addAmount <= 0}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Reducir Stock */}
      <Dialog
  open={openReduce}
  onClose={() => setOpenReduce(false)}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>Reducir Stock</DialogTitle>
  <DialogContent>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      {formatName(selectedItem?.categoria, selectedItem?.descripcion)}
    </Typography>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Stock actual: <strong>{selectedItem?.stock}</strong>
    </Typography>
    <TextField
      label="Cantidad a descontar"
      type="number"
      value={reduceAmount}
      onChange={(e) => setReduceAmount(e.target.value === "" ? "" : Number(e.target.value))}
      fullWidth
      inputRef={reduceInputRef} // Asignar la referencia
      sx={{ mt: 2 }}
      helperText={
        Number(reduceAmount) > (selectedItem?.stock ?? 0)
          ? "Se ajustará a 0 (no puede quedar negativo)"
          : " "
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" && reduceAmount !== "" && reduceAmount > 0) {
          handleReduceStock();
        }
      }}
    />
    {Number(reduceAmount) > 0 && (
      <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
        Nuevo stock:{" "}
        {Math.max(0, (selectedItem?.stock || 0) - Number(reduceAmount))}{" "}
        {pluralAuto(
          medidaLabel(selectedItem?.medida),
          Math.max(0, (selectedItem?.stock || 0) - Number(reduceAmount))
        )}
      </Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenReduce(false)}>Cancelar</Button>
    <Button
      variant="contained"
      onClick={handleReduceStock}
      disabled={reduceAmount === "" || reduceAmount <= 0}
    >
      Descontar
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}