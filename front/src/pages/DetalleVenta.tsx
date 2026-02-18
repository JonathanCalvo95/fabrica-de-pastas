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
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { ArrowBack, PictureAsPdf } from "@mui/icons-material";
import { getVenta, anularVenta, type VentaDetail } from "../api/ventas";
import { metodoPagoLabel, estadoVentaInfo, medidaLabel } from "../utils/enums";
import { formatName } from "../utils/formatters";
import { pluralAuto } from "../utils/plural";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "error" as "success" | "error" | "info" | "warning",
  });

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
      setSnack({ open: true, message: "Venta anulada correctamente", severity: "success" });
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? "No se pudo anular la venta";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!venta) return;

    const doc = new jsPDF();
    
    // Cargar y agregar logo
    try {
      const img = new Image();
      img.src = '/logo.png';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if logo fails
      });
      if (img.complete && img.naturalWidth > 0) {
        doc.addImage(img, 'PNG', 90, 5, 30, 30);
      }
    } catch (e) {
      // Continue without logo if it fails
    }
    
    // Título
    doc.setFontSize(18);
    doc.text("Fábrica de Pastas", 105, 42, { align: "center" });
    doc.setFontSize(12);
    doc.text("La Yema de Oro", 105, 49, { align: "center" });
    doc.setFontSize(14);
    doc.text("Detalle de Venta", 105, 57, { align: "center" });
    
    // Información general
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha} - ${hora}`, 14, 67);
    doc.text(`Método de Pago: ${metodoPagoLabel(venta.metodoPago)}`, 14, 74);
    doc.text(`Estado: ${estadoVentaInfo(venta.estado).label}`, 14, 81);
    
    // Tabla de productos
    const tableData = venta.items.map(item => [
      formatName(item.categoria, item.descripcion),
      item.cantidad.toString(),
      pluralAuto(medidaLabel(item.medida), item.cantidad),
      money(item.precioUnitario),
      money(item.subtotal || 0),
    ]);
    
    autoTable(doc, {
      startY: 87,
      head: [['Producto', 'Cantidad', 'Medida', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [212, 165, 116] },
      foot: [['', '', '', 'Total:', money(venta.total)]],
      footStyles: { fillColor: [255, 255, 255], fontStyle: 'bold', textColor: [0, 0, 0] },
    });
    
    // Descargar
    doc.save(`venta-${id}.pdf`);
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
        <Button
          variant="outlined"
          startIcon={<PictureAsPdf />}
          onClick={handleDescargarPDF}
        >
          Descargar PDF
        </Button>
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
                    <Typography variant="body2" color="text.secondary">
                      Registrada en sesión de caja
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
