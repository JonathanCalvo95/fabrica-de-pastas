import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import { Add, Visibility, PictureAsPdf } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getVentas,
  getVentasByCajaId,
  getVenta,
  type VentaListItem,
  type MetodoPago,
  type EstadoVenta,
  anularVenta,
} from "../api/ventas";
import { getCajaActual, type CajaDto } from "../api/caja";
import { metodoPagoLabel, estadoVentaInfo, medidaLabel } from "../utils/enums";
import { formatName } from "../utils/formatters";
import { pluralAuto } from "../utils/plural";

// ===== Helpers de UI =====
const pagoChip = (p: MetodoPago) => {
  const map: Record<MetodoPago, string> = {
    1: "Efectivo",
    2: "Mercado Pago",
    3: "Transferencia",
  };
  return <Chip label={map[p] ?? p} size="small" />;
};

const estadoChip = (e: EstadoVenta) => {
  if (e === 1) return <Chip label="Realizada" color="success" size="small" />;
  if (e === 2) return <Chip label="Anulada" color="error" size="small" />;
  return <Chip label="Desconocido" color="default" size="small" />;
};

const fmtMoney = (n: number) =>
  n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });

const fmtFecha = (iso: string) => {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-AR");
  const hora = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { fecha, hora };
};

// ===== Página =====
export default function Ventas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // role guard: only Administrador and Vendedor can access this page
  useEffect(() => {
    const role = (() => {
      try {
        const t = localStorage.getItem("authToken");
        if (!t) return null;
        const payload = JSON.parse(
          atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        return payload?.role || payload?.roles?.[0] || payload?.rol || null;
      } catch {
        return null;
      }
    })();
    if (!role) return;
    const lc = String(role).toLowerCase();
    if (lc !== "administrador" && lc !== "vendedor") navigate("/error/403");
  }, [navigate]);

  const [ventas, setVentas] = useState<VentaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" | "warning" }>({ open: false, message: "", severity: "success" });
  const [dlgAnular, setDlgAnular] = useState<VentaListItem | null>(null);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoVenta | "">("");
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState<MetodoPago | "">("");

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [caja, setCaja] = useState<CajaDto | null>(null);
  const [loadingCaja, setLoadingCaja] = useState(true);

  // 🔹 Consultar ventas
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const cajaId = searchParams.get("cajaId");
        const data = cajaId 
          ? await getVentasByCajaId(cajaId)
          : await getVentas(50);
        if (alive) setVentas(data);
      } catch (err: any) {
        if (alive) setError(err?.message ?? "Error al cargar ventas");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchParams]);

  // Consultar caja abierta (usa /caja/current)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCaja(true);
      try {
        const data = await getCajaActual(); // ← ahora llama al endpoint correcto
        if (!alive) return;
        setCaja(data); // data puede ser CajaDto o null
      } catch {
        if (alive) setCaja(null);
      } finally {
        if (alive) setLoadingCaja(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 🔹 Resumen del día
  const resumen = useMemo(() => {
    if (!ventas.length)
      return {
        totalHoy: 0,
        cantidadHoy: 0,
        promedio: 0,
        anuladasHoy: 0,
        anuladasMontoHoy: 0,
      };
    const hoyStr = new Date().toLocaleDateString("en-CA");
    let totalHoy = 0;
    let cantidadHoy = 0;
    let anuladasHoy = 0;
    let anuladasMontoHoy = 0;

    for (const v of ventas) {
      const vStr = new Date(v.fecha).toLocaleDateString("en-CA");
      if (vStr === hoyStr) {
        totalHoy += v.total;
        cantidadHoy++;
        // Contar ventas anuladas del día
        if (v.estado === 2) {
          anuladasHoy++;
          anuladasMontoHoy += v.total;
        }
      }
    }
    const promedio = cantidadHoy ? totalHoy / cantidadHoy : 0;
    return { totalHoy, cantidadHoy, promedio, anuladasHoy, anuladasMontoHoy };
  }, [ventas]);

  // Filtrar ventas
  const rows = useMemo(() => {
    let filtered = [...ventas];

    // Filtro por fecha
    if (fechaDesde) {
      const desde = fechaDesde.startOf('day');
      filtered = filtered.filter(v => dayjs(v.fecha).isAfter(desde) || dayjs(v.fecha).isSame(desde, 'day'));
    }
    if (fechaHasta) {
      const hasta = fechaHasta.endOf('day');
      filtered = filtered.filter(v => dayjs(v.fecha).isBefore(hasta) || dayjs(v.fecha).isSame(hasta, 'day'));
    }

    // Filtro por estado
    if (estadoFiltro !== "") {
      filtered = filtered.filter(v => v.estado === estadoFiltro);
    }

    // Filtro por método de pago
    if (metodoPagoFiltro !== "") {
      filtered = filtered.filter(v => v.metodoPago === metodoPagoFiltro);
    }

    return filtered;
  }, [ventas, fechaDesde, fechaHasta, estadoFiltro, metodoPagoFiltro]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setPage(0);
  }, [fechaDesde, fechaHasta, estadoFiltro, metodoPagoFiltro]);

  // Función para descargar PDF de una venta
  const handleDescargarPDF = async (ventaId: string) => {
    try {
      const venta = await getVenta(ventaId);
      
      const fmtFechaHora = (iso?: string) => {
        if (!iso) return { f: "-", h: "-" };
        const d = new Date(iso);
        return {
          f: d.toLocaleDateString("es-AR"),
          h: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
        };
      };
      
      const { f: fecha, h: hora } = fmtFechaHora(venta.fecha);
      
      // Normalizar items con subtotal
      const items = (venta.items ?? []).map((it: any) => ({
        ...it,
        subtotal:
          typeof it.subtotal === "number"
            ? it.subtotal
            : Math.round((it.precioUnitario ?? 0) * (it.cantidad ?? 0) * 100) / 100,
      }));

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
      const tableData = items.map((item: any) => [
        formatName(item.categoria, item.descripcion),
        item.cantidad.toString(),
        pluralAuto(medidaLabel(item.medida), item.cantidad),
        fmtMoney(item.precioUnitario),
        fmtMoney(item.subtotal || 0),
      ]);
      
      autoTable(doc, {
        startY: 87,
        head: [['Producto', 'Cantidad', 'Medida', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [212, 165, 116] },
        foot: [['', '', '', 'Total:', fmtMoney(venta.total)]],
        footStyles: { fillColor: [255, 255, 255], fontStyle: 'bold', textColor: [0, 0, 0] },
      });
      
      // Descargar
      doc.save(`venta-${ventaId}.pdf`);
    } catch (e: any) {
      setSnack({ open: true, message: e?.response?.data ?? e?.message ?? "No se pudo generar el PDF", severity: "error" });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ p: 4 }}>
      {/* Encabezado */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{ mb: 0.5, letterSpacing: -0.3, fontWeight: 700 }}
          >
            Ventas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchParams.get("cajaId") 
              ? "Ventas de la sesión de caja seleccionada" 
              : "Registro de todas las transacciones"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {searchParams.get("cajaId") && (
            <Button
              variant="outlined"
              onClick={() => navigate("/ventas")}
            >
              Ver Todas
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            disabled={loadingCaja || !caja}
            onClick={() => navigate("/ventas/crear")}
          >
            Nueva Venta
          </Button>
        </Box>
      </Box>

      {/* Info de caja */}
      <Box sx={{ mb: 2 }}>
        {!loadingCaja && caja && (
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Caja abierta</strong> — Apertura{" "}
              {new Date(caja.apertura).toLocaleString("es-AR")}
            </Typography>
          </Alert>
        )}
        {!loadingCaja && !caja && (
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Atención:</strong> Debe abrir una caja en la sección de
              Gestión de Caja para registrar nuevas ventas.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Tarjetas resumen */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 3,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Total Hoy
            </Typography>
            <Typography variant="h3" color="primary">
              {fmtMoney(resumen.totalHoy)}
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              +{resumen.cantidadHoy} ventas
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Promedio por Venta (Hoy)
            </Typography>
            <Typography variant="h3">{fmtMoney(resumen.promedio)}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Ventas anuladas
            </Typography>
            <Typography variant="h3" color="error.main">
              {resumen.anuladasHoy}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {fmtMoney(resumen.anuladasMontoHoy)} hoy
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Filtros</Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
            <DatePicker
              label="Fecha Desde"
              value={fechaDesde}
              onChange={(newValue) => setFechaDesde(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  sx: { minWidth: 180 },
                },
              }}
            />
            <DatePicker
              label="Fecha Hasta"
              value={fechaHasta}
              onChange={(newValue) => setFechaHasta(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  sx: { minWidth: 180 },
                },
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFiltro}
                label="Estado"
                onChange={(e) => setEstadoFiltro(e.target.value as EstadoVenta | "")}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value={1}>Realizada</MenuItem>
                <MenuItem value={2}>Anulada</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={metodoPagoFiltro}
                label="Método de Pago"
                onChange={(e) => setMetodoPagoFiltro(e.target.value as MetodoPago | "")}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value={1}>Efectivo</MenuItem>
                <MenuItem value={2}>Mercado Pago</MenuItem>
                <MenuItem value={3}>Transferencia</MenuItem>
              </Select>
            </FormControl>
            {(fechaDesde || fechaHasta || estadoFiltro !== "" || metodoPagoFiltro !== "") && (
              <Button
                variant="outlined"
                onClick={() => {
                  setFechaDesde(null);
                  setFechaHasta(null);
                  setEstadoFiltro("");
                  setMetodoPagoFiltro("");
                }}
                sx={{ mt: 1 }}
              >
                Limpiar Filtros
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de ventas */}
      <Card sx={{ overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell>
                    <strong>Fecha</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Items</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Estado</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Pago</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Acciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((v) => {
                  const { fecha, hora } = fmtFecha(v.fecha);
                  return (
                    <TableRow
                      key={v.id}
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <TableCell>
                        <Typography fontWeight={500}>{fecha}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hora}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          {Array.isArray(v.items)
                            ? `${v.items.length} ${v.items.length === 1 ? "item" : "items"}`
                            : typeof v.items === "number"
                              ? `${v.items} ${v.items === 1 ? "item" : "items"}`
                              : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight={600}
                        >
                          {fmtMoney(v.total)}
                        </Typography>
                      </TableCell>
                      <TableCell>{estadoChip(v.estado)}</TableCell>
                      <TableCell>{pagoChip(v.metodoPago)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/ventas/${v.id}`)}
                          title="Ver detalle"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDescargarPDF(v.id)}
                          title="Descargar PDF"
                        >
                          <PictureAsPdf fontSize="small" />
                        </IconButton>
                        {v.estado === 1 && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ ml: 1 }}
                            disabled={cancellingId === v.id}
                            onClick={() => setDlgAnular(v)}
                          >
                            Anular
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box
                        sx={{
                          py: 6,
                          textAlign: "center",
                          color: "text.secondary",
                        }}
                      >
                        No hay ventas para mostrar.
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
          </>
        )}
      </Card>

      {/* Modal Anular Venta */}
      <Dialog
        open={!!dlgAnular}
        onClose={() => setDlgAnular(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Anular Venta</DialogTitle>
        <DialogContent>
          {dlgAnular && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  ¿Confirmás anular esta venta?
                </Typography>
                <Typography variant="body2">
                  El stock de los productos será repuesto.
                </Typography>
              </Alert>
              
              <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha
                </Typography>
                <Typography variant="body1" fontWeight={500} gutterBottom>
                  {fmtFecha(dlgAnular.fecha).fecha} • {fmtFecha(dlgAnular.fecha).hora}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Total
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
                  {fmtMoney(dlgAnular.total)}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Método de Pago
                </Typography>
                <Typography variant="body1">
                  {metodoPagoLabel(dlgAnular.metodoPago)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgAnular(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={cancellingId === dlgAnular?.id}
            onClick={async () => {
              if (!dlgAnular) return;
              try {
                setCancellingId(dlgAnular.id);
                await anularVenta(dlgAnular.id);
                setVentas(prev => prev.map(x => x.id === dlgAnular.id ? { ...x, estado: 2 as EstadoVenta } : x));
                setSnack({ open: true, message: "Venta anulada y stock repuesto", severity: "success" });
                setDlgAnular(null);
              } catch (e: any) {
                setSnack({ open: true, message: e?.response?.data ?? e?.message ?? "No se pudo anular la venta", severity: "error" });
              } finally {
                setCancellingId(null);
              }
            }}
          >
            {cancellingId === dlgAnular?.id ? "Anulando..." : "Confirmar Anulación"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ zIndex: (t) => t.zIndex.modal + 100, mt: 8 }}
      >
        <MuiAlert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%", zIndex: (t) => t.zIndex.modal + 100 }}
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
