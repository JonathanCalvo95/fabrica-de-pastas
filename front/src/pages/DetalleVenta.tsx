import { useEffect, useState, useMemo } from "react";
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
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { getVenta, anularVenta, type VentaDetail } from "../api/ventas";
import { metodoPagoLabel, estadoVentaInfo, medidaLabel } from "../utils/enums";
import { formatName } from "../utils/formatters";
import { pluralAuto } from "../utils/plural";

const money = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const fmtFechaHora = (iso?: string) => {
  if (!iso) return { f: "-", h: "-" };
  const d = new Date(iso);
  return {
    f: d.toLocaleDateString("es-AR"),
    h: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  };
};

export default function DetalleVenta() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [venta, setVenta] = useState<VentaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Cargar detalle desde el backend
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getVenta(id);
        if (!alive) return;

        // Normalizamos por si el back no manda "subtotal" por item
        const items = (data.items ?? []).map((it: any) => ({
          ...it,
          subtotal:
            typeof it.subtotal === "number"
              ? it.subtotal
              : Math.round(
                  (it.precioUnitario ?? 0) * (it.cantidad ?? 0) * 100
                ) / 100,
        }));

        setVenta({ ...data, items: items });
      } catch (e: any) {
        if (alive)
          setError(
            e?.response?.data ?? e?.message ?? "No se pudo cargar la venta"
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const { f: fecha, h: hora } = useMemo(
    () => fmtFechaHora(venta?.fecha),
    [venta?.fecha]
  );
  // Cantidad de productos distintos en la venta
  const totalItems = useMemo(
    () => new Set((venta?.items ?? []).map((it) => it.productoId)).size,
    [venta?.items]
  );

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !venta) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error ?? "Venta no encontrada"}</Alert>
        <Button onClick={() => navigate("/ventas")} sx={{ mt: 2 }}>
          Volver a Ventas
        </Button>
      </Box>
    );
  }

  const handleAnular = async () => {
    if (!id || !venta) return;
    if (!confirm("¿Confirmás anular esta venta? Se repondrá el stock.")) return;
    try {
      setSaving(true);
      const res = await anularVenta(id);
      // Normalizar subtotales nuevamente
      const items = (res.items ?? []).map((it: any) => ({
        ...it,
        subtotal:
          typeof it.subtotal === "number"
            ? it.subtotal
            : Math.round((it.precioUnitario ?? 0) * (it.cantidad ?? 0) * 100) / 100,
      }));
      setVenta({ ...res, items });
    } catch (e: any) {
      alert(e?.response?.data ?? e?.message ?? "No se pudo anular la venta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/ventas")}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h1" sx={{ mb: 0.5 }}>
              Detalle de Venta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fecha} a las {hora}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Productos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>
                        <strong>Descripcion</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Cantidad</strong>
                      </TableCell>
                      <TableCell align="left">
                        <strong>Medida</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Precio Unit.</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Subtotal</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {venta.items.map((it) => (
                      <TableRow key={it.productoId}>
                        <TableCell>
                          {formatName(it.categoria, it.descripcion)}
                        </TableCell>
                        <TableCell align="right">{it.cantidad}</TableCell>
                        <TableCell align="left">
                          {pluralAuto(medidaLabel(it.medida), it.cantidad)}
                        </TableCell>
                        <TableCell align="right">
                          {money(it.precioUnitario)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            {money(it.subtotal ?? 0)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="h5"
                          color="primary"
                          fontWeight={700}
                        >
                          {money(venta.total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {venta.observaciones && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Observaciones
                </Typography>
                <Typography color="text.secondary">
                  {venta.observaciones}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Información General
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Método de Pago
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {metodoPagoLabel(venta.metodoPago)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Estado
                </Typography>
                {(() => {
                  const est = estadoVentaInfo(venta.estado);
                  return (
                    <Box sx={{ mt: 1 }}>
                      <Chip label={est.label} color={est.color} size="small" />
                    </Box>
                  );
                })()}{" "}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Cantidad
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {`${totalItems} ${pluralAuto("producto", totalItems)}`}
                </Typography>
              </Box>

              {!!venta.cajaId && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Sesión de Caja
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      #{venta.cajaId}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumen
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h5" color="primary" fontWeight={700}>
                  {money(venta.total)}
                </Typography>
              </Box>

              {venta.estado === 1 && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleAnular}
                  disabled={saving}
                  sx={{ mt: 2 }}
                >
                  Anular Venta
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
