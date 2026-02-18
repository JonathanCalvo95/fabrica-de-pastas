import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  IconButton,
  Alert,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { get as getPedido, generarVenta } from "../api/pedidos";
import { getUsuario, type Usuario } from "../api/usuarios";
import { getUserRole } from "../utils/auth";
import { metodoPagoLabel, estadoPedidoInfo, medidaLabel } from "../utils/enums";
import { pluralAuto } from "../utils/plural";
import { formatName } from "../utils/formatters";

const money = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const fmtFechaHora = (iso?: string) => {
  if (!iso) return { f: "-", h: "-" };
  const d = new Date(iso);
  return { f: d.toLocaleDateString("es-AR"), h: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) };
};

export default function DetallePedido() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [usuarioNombre, setUsuarioNombre] = useState<string | null>(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "error" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getPedido(id);
        if (!alive) return;
        setPedido(data);
        // Si es admin, obtener nombre de usuario creador
        if ((data as any)?.usuarioId && getUserRole() === "Administrador") {
          try {
            const u: Usuario = await getUsuario((data as any).usuarioId);
            setUsuarioNombre(u.nombre);
          } catch {
            setUsuarioNombre(null);
          }
        }
      } catch (e: any) {
        if (alive) setError(e?.response?.data ?? e?.message ?? "No se pudo cargar el pedido");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const { f: fecha, h: hora } = useMemo(() => fmtFechaHora(pedido?.fecha), [pedido?.fecha]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !pedido) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error ?? "Pedido no encontrado"}</Alert>
        <Button onClick={() => navigate("/pedidos")} sx={{ mt: 2 }}>Volver a Pedidos</Button>
      </Box>
    );
  }

  const puedeGenerarVenta = !pedido.ventaId && pedido.estado === 2; // solo si está Confirmado

  const handleGenerarVenta = async () => {
    if (!id) return;
    if (pedido.estado !== 2) {
      setSnack({ open: true, message: "Solo se puede generar venta si el pedido está Confirmado", severity: "error" });
      return;
    }
    try {
      setSaving(true);
      const { ventaId } = await generarVenta(id, metodoPago as any);
      navigate(`/ventas/${ventaId}`);
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? "No se pudo generar la venta";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/pedidos")}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h1" sx={{ mb: 0.5 }}>Detalle de Pedido</Typography>
            <Typography variant="body2" color="text.secondary">{fecha} a las {hora}</Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Productos</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell><strong>Descripcion</strong></TableCell>
                      <TableCell align="right"><strong>Cantidad</strong></TableCell>
                      <TableCell align="left"><strong>Medida</strong></TableCell>
                      <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                      <TableCell align="right"><strong>Subtotal</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedido.items.map((it: any) => (
                      <TableRow key={it.productoId}>
                        <TableCell>{formatName(it.categoria, it.descripcion)}</TableCell>
                        <TableCell align="right">{it.cantidad}</TableCell>
                        <TableCell align="left">{pluralAuto(medidaLabel(it.medida), it.cantidad)}</TableCell>
                        <TableCell align="right">{money(it.precioUnitario)}</TableCell>
                        <TableCell align="right"><Typography fontWeight={600}>{money(it.subtotal ?? 0)}</Typography></TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right"><Typography variant="h6">Total:</Typography></TableCell>
                      <TableCell align="right"><Typography variant="h5" color="primary" fontWeight={700}>{money(pedido.total)}</Typography></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {pedido.observaciones && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Observaciones</Typography>
                <Typography color="text.secondary">{pedido.observaciones}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Información General</Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Usuario</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {usuarioNombre ?? (pedido.usuarioId ? `#${String(pedido.usuarioId).slice(-6)}` : "-")}
                </Typography>
              </Box>

              {pedido.cliente && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Cliente</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {pedido.cliente}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Estado</Typography>
                {(() => { const est = estadoPedidoInfo(pedido.estado); return (<Box sx={{ mt: 1 }}><Chip label={est.label} color={est.color as any} size="small" /></Box>); })()}
              </Box>

              {pedido.ventaId && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Venta Generada</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/ventas/${pedido.ventaId}`)}
                    sx={{ mt: 1 }}
                  >
                    Ver Venta
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h5" color="primary" fontWeight={700}>{money(pedido.total)}</Typography>
              </Box>
            </CardContent>
          </Card>

          {puedeGenerarVenta && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Generar Venta</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select value={String(metodoPago)} onChange={(e) => setMetodoPago(Number(e.target.value))} label="Método de Pago">
                    <MenuItem value={1}>{metodoPagoLabel(1)}</MenuItem>
                    <MenuItem value={2}>{metodoPagoLabel(2)}</MenuItem>
                    <MenuItem value={3}>{metodoPagoLabel(3)}</MenuItem>
                  </Select>
                </FormControl>
                <Button fullWidth variant="contained" onClick={handleGenerarVenta} disabled={saving}>Generar Venta</Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
