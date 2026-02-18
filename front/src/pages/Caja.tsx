import { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
  Grid,
  TablePagination,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import { Lock, LockOpen } from "@mui/icons-material";
import {
  getCajaActual,
  getHistorialCaja,
  getVentasEfectivo,
  abrirCaja,
  cerrarCaja,
  type CajaDto,
  type EstadoCaja,
} from "../api/caja";
import { estadoCajaInfo } from "../utils/enums";

// helpers
const EstadoChip = ({ value }: { value: EstadoCaja }) => {
  const cfg = estadoCajaInfo(value);
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
};

const money = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const formatFecha = (fecha: string | Date) => {
  const d = new Date(fecha);
  const f = d.toLocaleDateString("es-AR");
  const h = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${f}, ${h}`;
};

const diff = (calc?: number | null, real?: number | null) =>
  calc != null && real != null ? real - calc : null;

const diffColor = (d: number) =>
  d === 0 ? "success.main" : d > 0 ? "info.main" : "error.main";

export default function Caja() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ventasEfectivo, setVentasEfectivo] = useState(0);

  const [abierta, setAbierta] = useState<CajaDto | null>(null);
  const [historial, setHistorial] = useState<CajaDto[]>([]);

  // Filtros de fecha
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dlgAbrir, setDlgAbrir] = useState(false);
  const [dlgCerrar, setDlgCerrar] = useState(false);

  const [montoInicial, setMontoInicial] = useState("");
  const [montoReal, setMontoReal] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const montoEsperado = useMemo(() => {
    if (!abierta) return 0;
    return abierta.montoInicial + ventasEfectivo;
  }, [abierta, ventasEfectivo]);

  // Filtrar historial por fechas
  const historialFiltrado = useMemo(() => {
    if (!fechaDesde && !fechaHasta) return historial;

    return historial.filter((sesion) => {
      const fechaSesion = dayjs(sesion.apertura);
      
      if (fechaDesde) {
        const desde = fechaDesde.startOf('day');
        if (fechaSesion.isBefore(desde)) return false;
      }
      
      if (fechaHasta) {
        const hasta = fechaHasta.endOf('day');
        if (fechaSesion.isAfter(hasta)) return false;
      }
      
      return true;
    });
  }, [historial, fechaDesde, fechaHasta]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setPage(0);
  }, [fechaDesde, fechaHasta]);

  // Referencias para los campos de entrada
  const abrirInputRef = useRef<HTMLInputElement>(null);
  const cerrarInputRef = useRef<HTMLInputElement>(null);

  async function cargar() {
    try {
      setCargando(true);
      setError(null);
      const [open, hist, efectivo] = await Promise.all([
        getCajaActual(),
        getHistorialCaja(50),
        getVentasEfectivo(),
      ]);
      setAbierta(open);
      setHistorial(hist);
      setVentasEfectivo(efectivo);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar la caja");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onAbrir() {
    try {
      const monto = parseFloat(montoInicial || "0");
      if (isNaN(monto) || monto < 0) return;
      const nueva = await abrirCaja(monto);
      setAbierta(nueva);
      setHistorial((h) => [nueva, ...h]);
      setDlgAbrir(false);
      setMontoInicial("");
    } catch (e: any) {
      setError(e?.message ?? "No se pudo abrir la caja");
    }
  }

  async function onCerrar() {
    if (!abierta) return;
    try {
      const real = parseFloat(montoReal || "0");
      await cerrarCaja({
        monto: real,
        observaciones: observaciones || undefined,
      });
      await cargar();
      setDlgCerrar(false);
      setMontoReal("");
      setObservaciones("");
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cerrar la caja");
    }
  }

  const handleOpenAbrirDialog = () => {
    setDlgAbrir(true);
    setTimeout(() => abrirInputRef.current?.focus(), 100); // Colocar el cursor automáticamente
  };

  const handleOpenCerrarDialog = () => {
    setDlgCerrar(true);
    setTimeout(() => cerrarInputRef.current?.focus(), 100); // Colocar el cursor automáticamente
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ p: 4 }}>
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
            Gestión de Caja
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Apertura, cierre y control de caja diaria
          </Typography>
        </Box>

        {!abierta ? (
          <Button
            variant="contained"
            startIcon={<LockOpen />}
            onClick={handleOpenAbrirDialog}
          >
            Abrir Caja
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            startIcon={<Lock />}
            onClick={handleOpenCerrarDialog}
          >
            Cerrar Caja
          </Button>
        )}
      </Box>

      {cargando && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {abierta && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            Caja Abierta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Apertura: {formatFecha(abierta.apertura)} | Efectivo
            Inicial: {money(abierta.montoInicial)}
          </Typography>
        </Alert>
      )}

      {!abierta && !cargando && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            No hay caja abierta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Debe abrir una caja antes de realizar ventas
          </Typography>
        </Alert>
      )}

      {abierta && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Efectivo Apertura
                </Typography>
                <Typography variant="h3" color="primary">
                  {money(abierta.montoInicial)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Ventas en Efectivo
                </Typography>
                <Typography variant="h3" color="success.main">
                  {money(ventasEfectivo)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Efectivo Esperado
                </Typography>
                <Typography variant="h3">{money(montoEsperado)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ overflow: "hidden" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h2">
              Historial de Sesiones
            </Typography>
            
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <DatePicker
                label="Fecha de Apertura - Desde"
                value={fechaDesde}
                onChange={(newValue) => setFechaDesde(newValue)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    sx: { minWidth: 200 },
                  },
                }}
              />
              <DatePicker
                label="Fecha de Apertura - Hasta"
                value={fechaHasta}
                onChange={(newValue) => setFechaHasta(newValue)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    sx: { minWidth: 200 },
                  },
                }}
              />
              {(fechaDesde || fechaHasta) && (
                <Box sx={{ pt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFechaDesde(null);
                      setFechaHasta(null);
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>

        {cargando ? (
          <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
            <LinearProgress />
          </Box>
        ) : (
          <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell>
                    <strong>Apertura</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Cierre</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Efectivo Inicial</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Efectivo Calculado</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Efectivo en Caja</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Diferencia</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Estado</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Observaciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {historialFiltrado.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        {fechaDesde || fechaHasta ? "No hay sesiones en el rango seleccionado" : "No hay sesiones registradas"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  historialFiltrado.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s) => {
                  const d = diff(s.montoCalculado, s.montoReal);
                  return (
                    <TableRow
                      key={s.id}
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <TableCell>
                        <Typography fontWeight={500}>
                          {formatFecha(s.apertura)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          {s.cierre ? formatFecha(s.cierre) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          {money(s.montoInicial)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          {s.montoCalculado != null
                            ? money(s.montoCalculado)
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          {s.montoReal != null ? money(s.montoReal) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {d == null ? (
                          "-"
                        ) : (
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: diffColor(d) }}
                          >
                            {money(d)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <EstadoChip value={s.estado} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {s.observaciones || "-"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={historialFiltrado.length}
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

      <Dialog
        open={dlgAbrir}
        onClose={() => setDlgAbrir(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Abrir Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registre el monto inicial en efectivo con el que inicia la jornada
          </Typography>
          <TextField
            fullWidth
            label="Monto de Apertura"
            type="number"
            value={montoInicial}
            onChange={(e) => setMontoInicial(e.target.value)}
            inputRef={abrirInputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && montoInicial !== "" && parseFloat(montoInicial) > 0) {
                onAbrir();
              }
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgAbrir(false)}>Cancelar</Button>
          <Button variant="contained" onClick={onAbrir}>
            Abrir Caja
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cerrar caja */}
      <Dialog
        open={dlgCerrar}
        onClose={() => setDlgCerrar(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cerrar Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Apertura: {abierta ? new Date(abierta.apertura).toLocaleString() : "-"}
          </Typography>

          <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Efectivo Apertura
                </Typography>
                <Typography variant="h6">
                  {money(abierta?.montoInicial ?? 0)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Ventas en Efectivo
                </Typography>
                <Typography variant="h6" color="success.main">
                  {money(ventasEfectivo)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Efectivo Esperado
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  {money(montoEsperado)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            label="Efectivo en Caja"
            type="number"
            value={montoReal}
            onChange={(e) => setMontoReal(e.target.value)}
            inputRef={cerrarInputRef} // Asignar la referencia
            onKeyDown={(e) => {
              if (e.key === "Enter" && montoReal !== "" && parseFloat(montoReal) > 0) {
                onCerrar();
              }
            }}
            sx={{ mb: 2 }}
          />

          {montoReal && (
            <Alert
              severity={
                parseFloat(montoReal) === montoEsperado
                  ? "success"
                  : parseFloat(montoReal) > montoEsperado
                    ? "info"
                    : "error"
              }
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Diferencia:{" "}
                {money(Math.abs(parseFloat(montoReal) - montoEsperado))}
              </Typography>
              <Typography variant="body2">
                {parseFloat(montoReal) === montoEsperado
                  ? "Cierre exacto"
                  : parseFloat(montoReal) > montoEsperado
                    ? "Sobra dinero"
                    : "Falta dinero"}
              </Typography>
            </Alert>
          )}

          <TextField
            fullWidth
            label="Observaciones"
            multiline
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas adicionales sobre el cierre…"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgCerrar(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={onCerrar}
            disabled={!montoReal}
          >
            Cerrar Caja
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </LocalizationProvider>
  );
}