import { useEffect, useMemo, useState } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { Add, Delete, ArrowBack, ShoppingCart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { get as getProductos, type Producto } from "../api/productos";
import { crearVenta, type MetodoPago } from "../api/ventas";
import { getCajaActual, type CajaDto } from "../api/caja";
import { categoriaLabel } from "../utils/enums";

interface ProductoVenta {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

const money = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const metodoPagoToNumber = (s: string): MetodoPago => {
  if (s === "Efectivo") return 1; // Cash
  if (s === "Mercado Pago") return 2; // MP
  return 3; // Transferencia
};

export default function CrearVenta() {
  const navigate = useNavigate();

  // productos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  // caja
  const [caja, setCaja] = useState<CajaDto | null>(null);
  const cajaAbierta = !!caja;

  // venta
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([]);
  const [cantidad, setCantidad] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");

  // snackbar
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [redirectOnClose, setRedirectOnClose] = useState(false);

  // cargar productos
  useEffect(() => {
    (async () => {
      try {
        setLoadingProductos(true);
        const prods = await getProductos();
        setProductos(prods.filter((p) => p.activo)); // sólo activos
      } finally {
        setLoadingProductos(false);
      }
    })();
  }, []);

  // cargar caja actual
  useEffect(() => {
    (async () => {
      try {
        const c = await getCajaActual();
        setCaja(c);
      } catch {
        setCaja(null);
      }
    })();
  }, []);

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    const { id, categoria, descripcion, precio } = productoSeleccionado;
    const existe = productosVenta.find((p) => p.id === id);

    if (existe) {
      const nuevaCant = existe.cantidad + cantidad;
      setProductosVenta((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, cantidad: nuevaCant, subtotal: nuevaCant * p.precio }
            : p
        )
      );
    } else {
      setProductosVenta((prev) => [
        ...prev,
        {
          id,
          nombre: categoriaLabel(categoria) + ": " + descripcion,
          precio,
          cantidad,
          subtotal: precio * cantidad,
        },
      ]);
    }

    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const handleEliminarProducto = (id: string) =>
    setProductosVenta((prev) => prev.filter((p) => p.id !== id));

  const handleActualizarCantidad = (id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return handleEliminarProducto(id);
    setProductosVenta((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * p.precio,
            }
          : p
      )
    );
  };

  const total = useMemo(
    () => productosVenta.reduce((sum, p) => sum + p.subtotal, 0),
    [productosVenta]
  );

  const handleFinalizarVenta = async () => {
    if (!productosVenta.length) {
      setSnack({
        open: true,
        message: "Agregá al menos un producto.",
        severity: "warning",
      });
      return;
    }
    if (!metodoPago) {
      setSnack({
        open: true,
        message: "Seleccioná un método de pago.",
        severity: "warning",
      });
      return;
    }
    const mp = metodoPagoToNumber(metodoPago);
    if (mp === 1 && !cajaAbierta) {
      setSnack({
        open: true,
        message: "Debés abrir una caja para ventas en efectivo.",
        severity: "error",
      });
      return;
    }

    try {
      await crearVenta({
        productos: productosVenta.map((p) => ({
          productoId: p.id,
          cantidad: p.cantidad,
        })),
        metodoPago: mp,
        observaciones:
          [observaciones ? `Obs: ${observaciones}` : ""]
            .filter(Boolean)
            .join(" | ") || undefined,
      });

      setSnack({
        open: true,
        message: "Venta creada correctamente",
        severity: "success",
      });
      setRedirectOnClose(true);
    } catch (e: any) {
      const msg =
        e?.response?.data ?? e?.message ?? "No se pudo registrar la venta.";
      setSnack({ open: true, message: msg, severity: "error" });
    }
  };

  const handleSnackClose = () => {
    setSnack((s) => ({ ...s, open: false }));
    if (redirectOnClose) navigate("/ventas");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
        <IconButton onClick={() => navigate("/ventas")}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h1" sx={{ mb: 0.5 }}>
            Nueva Venta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registrar una nueva transacción
          </Typography>
        </Box>
      </Box>

      {!cajaAbierta && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Atención:</strong> Debe abrir una caja antes de registrar
            ventas en efectivo
          </Typography>
        </Alert>
      )}

      {cajaAbierta && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Sesión de Caja Activa:</strong> #{caja?.id} — Las ventas en
            efectivo se registrarán en esta sesión
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
              >
                <ShoppingCart />
                Agregar Productos
              </Typography>

              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={productos}
                  loading={loadingProductos}
                  getOptionLabel={(o) =>
                    `${
                      categoriaLabel(o?.categoria) + ": " + o?.descripcion
                    } — ${money(o.precio)}`
                  }
                  value={productoSeleccionado}
                  onChange={(_, v) => setProductoSeleccionado(v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Buscar producto" />
                  )}
                />
                <TextField
                  type="number"
                  label="Cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  sx={{ width: 120 }}
                  inputProps={{ min: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAgregarProducto}
                  disabled={!productoSeleccionado}
                  startIcon={<Add />}
                  sx={{ height: 56 }}
                >
                  Agregar
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell>
                      <strong>Producto</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Precio Unit.</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Cantidad</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Subtotal</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Acción</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosVenta.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                          No hay productos agregados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosVenta.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.nombre}</TableCell>
                        <TableCell align="right">{money(p.precio)}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={p.cantidad}
                            onChange={(e) =>
                              handleActualizarCantidad(
                                p.id,
                                Number(e.target.value)
                              )
                            }
                            sx={{ width: 80 }}
                            inputProps={{ min: 0 }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            {money(p.subtotal)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleEliminarProducto(p.id)}
                            size="small"
                          >
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
              <Typography variant="h6" sx={{ mb: 3 }}>
                Resumen de Venta
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Método de Pago *</InputLabel>
                <Select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  label="Método de Pago *"
                >
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Mercado Pago">Mercado Pago</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="text.secondary">Items:</Typography>
                  <Typography fontWeight={500}>
                    {productosVenta.reduce((sum, p) => sum + p.cantidad, 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h5" color="primary" fontWeight={700}>
                    {money(total)}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleFinalizarVenta}
                disabled={productosVenta.length === 0 || !cajaAbierta}
                sx={{ mt: 2 }}
              >
                Finalizar Venta
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/ventas")}
                sx={{ mt: 1 }}
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          onClose={handleSnackClose}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
