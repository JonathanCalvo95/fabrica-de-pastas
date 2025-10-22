import { useState } from "react";
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
  Grid,
} from "@mui/material";
import { Lock, LockOpen } from "@mui/icons-material";

type CashSessionStatus = "open" | "closed" | "paused";

interface CashSession {
  id: number;
  apertura: string;
  cierre: string | null;
  montoApertura: number;
  montoCierreCalculado: number | null;
  montoCierreReal: number | null;
  usuarioId: string;
  estado: CashSessionStatus;
  observaciones: string;
}

const sesionesIniciales: CashSession[] = [
  {
    id: 1,
    apertura: "2025-10-14 08:00",
    cierre: "2025-10-14 20:00",
    montoApertura: 5000,
    montoCierreCalculado: 18750,
    montoCierreReal: 18745,
    usuarioId: "user1",
    estado: "closed",
    observaciones: "Faltaron 5 pesos.",
  },
  {
    id: 2,
    apertura: "2025-10-13 08:00",
    cierre: "2025-10-13 19:30",
    montoApertura: 5000,
    montoCierreCalculado: 23700,
    montoCierreReal: 23700,
    usuarioId: "user1",
    estado: "closed",
    observaciones: "Cierre exacto.",
  },
];

const getStatusChip = (estado: CashSessionStatus) => {
  const statusConfig = {
    open: { label: "Abierta", color: "success" as const },
    closed: { label: "Cerrada", color: "default" as const },
    paused: { label: "Pausada", color: "warning" as const },
  };
  const config = statusConfig[estado];
  return <Chip label={config.label} color={config.color} size="small" />;
};

export default function CajaMUI() {
  const [sesiones, setSesiones] = useState<CashSession[]>(sesionesIniciales);
  const [openApertura, setOpenApertura] = useState(false);
  const [openCierre, setOpenCierre] = useState(false);
  const [montoApertura, setMontoApertura] = useState("5000");
  const [montoCierreReal, setMontoCierreReal] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const sesionActiva = sesiones.find((s) => s.estado === "open");

  const handleAbrirCaja = () => {
    const nuevaSesion: CashSession = {
      id: sesiones.length + 1,
      apertura: new Date().toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      cierre: null,
      montoApertura: parseFloat(montoApertura),
      montoCierreCalculado: null,
      montoCierreReal: null,
      usuarioId: "user1",
      estado: "open",
      observaciones: "",
    };
    setSesiones([nuevaSesion, ...sesiones]);
    setOpenApertura(false);
    setMontoApertura("5000");
  };

  const handleCerrarCaja = () => {
    if (!sesionActiva) return;

    // Simular ventas en efectivo del día (en producción vendría de la BD)
    const ventasEfectivo = 8750; // Ejemplo: suma de ventas en efectivo
    const montoCierreCalculado = sesionActiva.montoApertura + ventasEfectivo;
    const montoRealIngresado = parseFloat(montoCierreReal);
    const diferencia = montoRealIngresado - montoCierreCalculado;

    const sesionCerrada: CashSession = {
      ...sesionActiva,
      cierre: new Date().toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      montoCierreCalculado,
      montoCierreReal: montoRealIngresado,
      estado: "closed",
      observaciones:
        diferencia === 0
          ? "Cierre exacto."
          : diferencia > 0
            ? `Sobraron $${Math.abs(diferencia).toFixed(2)}.`
            : `Faltaron $${Math.abs(diferencia).toFixed(2)}.`,
    };

    setSesiones(
      sesiones.map((s) => (s.id === sesionActiva.id ? sesionCerrada : s))
    );
    setOpenCierre(false);
    setMontoCierreReal("");
    setObservaciones("");
  };

  const montoCierreCalculado = sesionActiva
    ? sesionActiva.montoApertura + 8750
    : 0;

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
        {!sesionActiva ? (
          <Button
            variant="contained"
            startIcon={<LockOpen />}
            onClick={() => setOpenApertura(true)}
          >
            Abrir Caja
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            startIcon={<Lock />}
            onClick={() => setOpenCierre(true)}
          >
            Cerrar Caja
          </Button>
        )}
      </Box>

      {sesionActiva && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            Caja Abierta - Sesión #{sesionActiva.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Apertura: {sesionActiva.apertura} | Monto Inicial: $
            {sesionActiva.montoApertura.toLocaleString()}
          </Typography>
        </Alert>
      )}

      {!sesionActiva && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            No hay caja abierta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Debe abrir una caja antes de realizar ventas en efectivo
          </Typography>
        </Alert>
      )}

      {sesionActiva && (
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
                  ${sesionActiva.montoApertura.toLocaleString()}
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
                  $8,750
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
                  ${montoCierreCalculado.toLocaleString()}
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
                {sesiones.map((sesion) => {
                  const diferencia =
                    sesion.montoCierreReal && sesion.montoCierreCalculado
                      ? sesion.montoCierreReal - sesion.montoCierreCalculado
                      : null;
                  return (
                    <TableRow
                      key={sesion.id}
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          #{sesion.id.toString().padStart(3, "0")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {sesion.apertura}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {sesion.cierre || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>
                          ${sesion.montoApertura.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {sesion.montoCierreCalculado
                            ? `$${sesion.montoCierreCalculado.toLocaleString()}`
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {sesion.montoCierreReal
                            ? `$${sesion.montoCierreReal.toLocaleString()}`
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {diferencia !== null && (
                          <Typography
                            fontWeight={600}
                            color={
                              diferencia === 0
                                ? "success.main"
                                : diferencia > 0
                                  ? "info.main"
                                  : "error.main"
                            }
                          >
                            {diferencia === 0
                              ? "$0"
                              : diferencia > 0
                                ? `+$${diferencia.toFixed(2)}`
                                : `-$${Math.abs(diferencia).toFixed(2)}`}
                          </Typography>
                        )}
                        {diferencia === null && "-"}
                      </TableCell>
                      <TableCell>{getStatusChip(sesion.estado)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {sesion.observaciones || "-"}
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

      {/* Dialog Apertura */}
      <Dialog
        open={openApertura}
        onClose={() => setOpenApertura(false)}
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
          <Button onClick={() => setOpenApertura(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAbrirCaja}>
            Abrir Caja
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Cierre */}
      <Dialog
        open={openCierre}
        onClose={() => setOpenCierre(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cerrar Caja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sesión #{sesionActiva?.id} - Apertura: {sesionActiva?.apertura}
          </Typography>

          <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Monto Apertura
                </Typography>
                <Typography variant="h6">
                  ${sesionActiva?.montoApertura.toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Ventas en Efectivo
                </Typography>
                <Typography variant="h6" color="success.main">
                  $8,750
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Monto Esperado
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  ${montoCierreCalculado.toLocaleString()}
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
                parseFloat(montoCierreReal) === montoCierreCalculado
                  ? "success"
                  : parseFloat(montoCierreReal) > montoCierreCalculado
                    ? "info"
                    : "error"
              }
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" fontWeight={600}>
                Diferencia: $
                {Math.abs(
                  parseFloat(montoCierreReal) - montoCierreCalculado
                ).toFixed(2)}
              </Typography>
              <Typography variant="body2">
                {parseFloat(montoCierreReal) === montoCierreCalculado
                  ? "Cierre exacto"
                  : parseFloat(montoCierreReal) > montoCierreCalculado
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
            placeholder="Notas adicionales sobre el cierre..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCierre(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCerrarCaja}
            disabled={!montoCierreReal}
          >
            Cerrar Caja
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
