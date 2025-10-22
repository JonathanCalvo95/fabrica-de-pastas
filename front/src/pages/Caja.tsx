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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Lock, LockOpen } from "@mui/icons-material";
import {
  getCajaActual,
  getHistorialCaja,
  abrirCaja,
  cerrarCaja,
  type CajaDto,
  type EstadoCaja,
} from "../api/caja";

// helpers
const estadoChip = (estado: EstadoCaja) => {
  const map = {
    1: { label: "Abierta", color: "success" as const },
    2: { label: "Cerrada", color: "default" as const },
    3: { label: "Pausada", color: "warning" as const },
  };
  const cfg = map[estado] ?? map[2];
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
};

export default function Caja() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [abierta, setAbierta] = useState<CajaDto | null>(null);
  const [historial, setHistorial] = useState<CajaDto[]>([]);

  // diálogos
  const [dlgAbrir, setDlgAbrir] = useState(false);
  const [dlgCerrar, setDlgCerrar] = useState(false);

  // formularios
  const [montoApertura, setMontoApertura] = useState("5000");
  const [montoCierreReal, setMontoCierreReal] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // ventas en efectivo del día (ejemplo visual; en producción puede venir del back)
  const ventasEfectivo = 8750;

  const montoEsperado = useMemo(() => {
    if (!abierta) return 0;
    return abierta.montoApertura + ventasEfectivo;
  }, [abierta]);

  async function cargar() {
    try {
      setCargando(true);
      setError(null);
      const [open, hist] = await Promise.all([
        getCajaActual(),
        getHistorialCaja(50),
      ]);
      setAbierta(open);
      setHistorial(hist);
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
      const monto = parseFloat(montoApertura || "0");
      if (isNaN(monto) || monto < 0) return;
      const nueva = await abrirCaja(monto);
      setAbierta(nueva);
      // refresco historial
      setHistorial((h) => [nueva, ...h]);
      setDlgAbrir(false);
      setMontoApertura("5000");
    } catch (e: any) {
      setError(e?.message ?? "No se pudo abrir la caja");
    }
  }

  async function onCerrar() {
    if (!abierta) return;
    try {
      const real = parseFloat(montoCierreReal || "0");
      await cerrarCaja({
        montoCierreReal: real,
        observaciones: observaciones || undefined,
      });
      // recargar todo para ver estado actualizado
      await cargar();
      setDlgCerrar(false);
      setMontoCierreReal("");
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
            Inicial: ${abierta.montoApertura.toLocaleString()}
          </Typography>
        </Alert>
      )}

      {!abierta && !cargando && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            No hay caja abierta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Debe abrir una caja antes de realizar ventas en efectivo
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
                  Monto Apertura
                </Typography>
                <Typography variant="h3" color="primary">
                  ${abierta.montoApertura.toLocaleString()}
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
                  ${ventasEfectivo.toLocaleString()}
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
                <Typography variant="h3">
                  ${montoEsperado.toLocaleString()}
                </Typography>
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
                    <strong>ID</strong>
                  </TableCell>
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
                    <strong>Estado</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Observaciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {historial.map((s) => (
                  <TableRow
                    key={s.id}
                    sx={{ "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        #{s.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(s.apertura).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {s.cierre ? new Date(s.cierre).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>${s.montoApertura.toLocaleString()}</TableCell>
                    <TableCell>
                      {s.montoCierreCalculado != null
                        ? `$${s.montoCierreCalculado.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {s.montoCierreReal != null
                        ? `$${s.montoCierreReal.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>{estadoChip(s.estado)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {s.observaciones || "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
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
            value={montoApertura}
            onChange={(e) => setMontoApertura(e.target.value)}
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
                  Monto Apertura
                </Typography>
                <Typography variant="h6">
                  ${abierta?.montoApertura.toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Ventas en Efectivo
                </Typography>
                <Typography variant="h6" color="success.main">
                  ${ventasEfectivo.toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Monto Esperado
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  ${montoEsperado.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            label="Monto Real en Caja"
            type="number"
            value={montoCierreReal}
            onChange={(e) => setMontoCierreReal(e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
            sx={{ mb: 2 }}
          />

          {montoCierreReal && (
            <Alert
              severity={
                parseFloat(montoCierreReal) === montoEsperado
                  ? "success"
                  : parseFloat(montoCierreReal) > montoEsperado
                    ? "info"
                    : "error"
              }
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Diferencia: $
                {Math.abs(parseFloat(montoCierreReal) - montoEsperado).toFixed(
                  2
                )}
              </Typography>
              <Typography variant="body2">
                {parseFloat(montoCierreReal) === montoEsperado
                  ? "Cierre exacto"
                  : parseFloat(montoCierreReal) > montoEsperado
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
            disabled={!montoCierreReal}
          >
            Cerrar Caja
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
