import { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
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

  const [dlgAbrir, setDlgAbrir] = useState(false);
  const [dlgCerrar, setDlgCerrar] = useState(false);

  const [montoInicial, setMontoInicial] = useState("");
  const [montoReal, setMontoReal] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const montoEsperado = useMemo(() => {
    if (!abierta) return 0;
    return abierta.montoInicial + ventasEfectivo;
  }, [abierta, ventasEfectivo]);

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
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>
            Gestión de Caja
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Apertura, cierre y control de caja diaria
          </Typography>
        </Box>

        {!abierta ? (
          <Button
            variant="contained"
            startIcon={<LockOpen />}
            onClick={() => setDlgAbrir(true)}
          >
            Abrir Caja
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            startIcon={<Lock />}
            onClick={() => setDlgCerrar(true)}
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
            Caja Abierta – Sesión #{abierta.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Apertura: {new Date(abierta.apertura).toLocaleString()} | Monto
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
                  Monto Esperado
                </Typography>
                <Typography variant="h3">{money(montoEsperado)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Typography variant="h2" sx={{ mb: 3 }}>
            Historial de Sesiones
          </Typography>

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
                    <strong>Monto Inicial</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Monto Calculado</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Monto Real</strong>
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
                {historial.map((s) => {
                  const d = diff(s.montoCalculado, s.montoReal);
                  return (
                    <TableRow
                      key={s.id}
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <TableCell>
                        {new Date(s.apertura).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {s.cierre ? new Date(s.cierre).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>{money(s.montoInicial)}</TableCell>
                      <TableCell>
                        {s.montoCalculado != null
                          ? money(s.montoCalculado)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {s.montoReal != null ? money(s.montoReal) : "-"}
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
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Abrir caja */}
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
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
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
            Sesión #{abierta?.id} – Apertura:{" "}
            {abierta ? new Date(abierta.apertura).toLocaleString() : "-"}
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
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
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
  );
}
