import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Autocomplete,
  createFilterOptions,
  Divider,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { Add, Delete, ArrowBack, Assignment } from "@mui/icons-material";
import { get as getProductos, type Producto } from "../api/productos";
import { create as crearPedido } from "../api/pedidos";
import { formatName } from "../utils/formatters";
import { medidaLabel, categoriaLabel } from "../utils/enums";
import { pluralAuto } from "../utils/plural";

interface ProductoPedido {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  medida?: number;
  stock: number;
}

const money = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default function CrearPedido() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const [items, setItems] = useState<ProductoPedido[]>([]);
  const [cantidad, setCantidad] = useState<number>(1);
  const [cliente, setCliente] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "info" | "warning" });

  useEffect(() => {
    (async () => {
      try {
        setLoadingProductos(true);
        const prods = await getProductos();
        setProductos(prods.filter((p) => p.activo));
      } finally {
        setLoadingProductos(false);
      }
    })();
  }, []);

  // Filtro personalizado para búsqueda flexible sin guiones
  const filterOptions = createFilterOptions<Producto>({
    matchFrom: 'any',
    stringify: (option) => {
      const categoria = categoriaLabel(option.categoria);
      const desc = option.descripcion || "";
      return `${categoria} ${desc}`.replace(/-/g, " ").replace(/\s+/g, " ").toLowerCase();
    },
  });

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    const { id, categoria, descripcion, precio, medida, stock } = productoSeleccionado;
    
    // Validar stock disponible
    if (stock === 0) {
      setSnack({
        open: true,
        message: "Este producto no tiene stock disponible.",
        severity: "error",
      });
      return;
    }
    
    if (cantidad > stock) {
      setSnack({
        open: true,
        message: `Stock insuficiente. Solo hay ${stock} disponibles.`,
        severity: "error",
      });
      return;
    }

    const existe = items.find((p) => p.id === id);

    if (existe) {
      const nuevaCant = existe.cantidad + cantidad;
      setItems((prev) => prev.map((p) => p.id === id ? { ...p, cantidad: nuevaCant, subtotal: nuevaCant * p.precio } : p));
    } else {
      setItems((prev) => [
        ...prev,
        { id, nombre: formatName(categoria, descripcion), precio, cantidad, subtotal: precio * cantidad, medida, stock }
      ]);
    }

    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const handleEliminarProducto = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const handleActualizarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return handleEliminarProducto(id);
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, cantidad: nuevaCantidad, subtotal: nuevaCantidad * p.precio } : p));
  };

  const total = useMemo(() => items.reduce((sum, p) => sum + p.subtotal, 0), [items]);

  const handleCrearPedido = async () => {
    if (!items.length) {
      setSnack({ open: true, message: "Agregá al menos un producto.", severity: "warning" });
      return;
    }

    if (!cliente || cliente.trim() === "") {
      setSnack({ open: true, message: "El nombre del cliente es obligatorio.", severity: "warning" });
      return;
    }

    try {
      await crearPedido({
        items: items.map((p) => ({ productoId: p.id, cantidad: p.cantidad })),
        cliente: cliente.trim(),
        observaciones: observaciones || undefined,
      });
      setSnack({ open: true, message: "Pedido creado correctamente", severity: "success" });
      setTimeout(() => navigate("/pedidos"), 500);
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? "No se pudo crear el pedido.";
      setSnack({ open: true, message: msg, severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <IconButton onClick={() => navigate("/pedidos")}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>
            Nuevo Pedido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cargar un nuevo pedido
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Assignment />
                Productos del Pedido
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Autocomplete
                    sx={{ flex: 1 }}
                    options={productos}
                    loading={loadingProductos}
                    filterOptions={filterOptions}
                    getOptionLabel={(o) => `${formatName(o.categoria, o.descripcion)} - ${money(o.precio)}`}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                          <Typography variant="body2">
                            {formatName(option.categoria, option.descripcion)} - {money(option.precio)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Stock disponible: {option.stock}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    value={productoSeleccionado}
                    onChange={(_, v) => setProductoSeleccionado(v)}
                    renderInput={(params) => <TextField {...params} label="Buscar producto" />}
                  />
                  <TextField type="number" label="Cantidad" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} sx={{ width: 120 }} inputProps={{ min: 1 }} />
                  <Button
                    variant="contained"
                    onClick={handleAgregarProducto}
                    disabled={
                      !productoSeleccionado ||
                      productoSeleccionado.stock === 0 ||
                      cantidad > productoSeleccionado.stock
                    }
                    startIcon={<Add />}
                    sx={{ height: 56 }}
                  >
                    Agregar
                  </Button>
                </Box>
                {productoSeleccionado && cantidad > productoSeleccionado.stock && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    Stock disponible: {productoSeleccionado.stock}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell><strong>Descripción</strong></TableCell>
                    <TableCell align="center"><strong>Cantidad</strong></TableCell>
                    <TableCell align="left"><strong>Medida</strong></TableCell>
                    <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                    <TableCell align="right"><strong>Subtotal</strong></TableCell>
                    <TableCell align="center"><strong>Acción</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No hay productos agregados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {p.nombre}
                          {p.cantidad > p.stock && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                              Stock disponible: {p.stock}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <TextField type="number" value={p.cantidad} onChange={(e) => handleActualizarCantidad(p.id, Number(e.target.value))} sx={{ width: 80 }} size="small" />
                        </TableCell>
                        <TableCell align="left">{pluralAuto(medidaLabel(p.medida), p.cantidad)}</TableCell>
                        <TableCell align="right">{money(p.precio)}</TableCell>
                        <TableCell align="right"><Typography fontWeight={600}>{money(p.subtotal)}</Typography></TableCell>
                        <TableCell align="center">
                          <IconButton color="error" onClick={() => handleEliminarProducto(p.id)} size="small">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: "sticky", top: 24 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Datos del Pedido</Typography>
              <TextField 
                fullWidth 
                required
                label="Nombre del Cliente" 
                value={cliente} 
                onChange={(e) => setCliente(e.target.value)} 
                sx={{ mb: 2 }} 
                placeholder="Ingrese nombre del cliente"
                error={cliente.trim() === "" && items.length > 0}
                helperText={cliente.trim() === "" && items.length > 0 ? "Este campo es obligatorio" : ""}
              />
              <TextField fullWidth multiline rows={3} label="Observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} sx={{ mb: 3 }} />

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h5" color="primary" fontWeight={700}>{money(total)}</Typography>
              </Box>

              <Button fullWidth variant="contained" size="large" onClick={handleCrearPedido} disabled={items.length === 0} sx={{ mt: 2 }}>Crear Pedido</Button>
              <Button fullWidth variant="outlined" onClick={() => navigate("/pedidos")} sx={{ mt: 1 }}>Cancelar</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "right" }} sx={{ zIndex: (t) => t.zIndex.modal + 100, mt: 8 }}>
        <MuiAlert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.severity} variant="filled" sx={{ width: "100%", zIndex: (t) => t.zIndex.modal + 100 }}>
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
