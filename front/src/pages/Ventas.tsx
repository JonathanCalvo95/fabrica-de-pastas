import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { Add, Visibility } from "@mui/icons-material";

import {
  getVentas,
  type VentaListItem,
  type MetodoPago,
  type EstadoVenta,
} from "../api/ventas";
import { getCajaActual, type CajaDto } from "../api/caja";

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
  if (e === 1) return <Chip label="Completada" color="success" size="small" />;
  if (e === 2) return <Chip label="Anulada" color="error" size="small" />;
  return <Chip label="Devuelta" color="warning" size="small" />;
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

  const [ventas, setVentas] = useState<VentaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [caja, setCaja] = useState<CajaDto | null>(null);
  const [loadingCaja, setLoadingCaja] = useState(true);

  // 🔹 Consultar ventas
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVentas(50);
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
  }, []);

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
        pendientes: 0,
        pendientesMonto: 0,
      };
    const hoyStr = new Date().toLocaleDateString("en-CA");
    let totalHoy = 0;
    let cantidadHoy = 0;
    let pendientes = 0;
    let pendientesMonto = 0;

    for (const v of ventas) {
      const vStr = new Date(v.fecha).toLocaleDateString("en-CA");
      if (vStr === hoyStr) {
        totalHoy += v.total;
        cantidadHoy++;
      }
      if (v.estado !== 1) {
        pendientes++;
        pendientesMonto += v.total;
      }
    }
    const promedio = cantidadHoy ? totalHoy / cantidadHoy : 0;
    return { totalHoy, cantidadHoy, promedio, pendientes, pendientesMonto };
  }, [ventas]);

  // ===== UI =====
  return (
    <Box sx={{ p: 4 }}>
      {/* Encabezado */}
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
            Ventas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registro de todas las transacciones
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          disabled={loadingCaja || !caja} // deshabilitada si no hay caja abierta
          onClick={() => navigate("/ventas/crear")}
        >
          Nueva Venta
        </Button>
      </Box>

      {/* Info de caja */}
      {!loadingCaja && caja && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Caja abierta:</strong> Sesión #{caja.id} — Apertura{" "}
            {new Date(caja.apertura).toLocaleString("es-AR")}
          </Typography>
        </Alert>
      )}
      {!loadingCaja && !caja && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Atención:</strong> Debe abrir una caja en la sección de
            Gestión de Caja para registrar nuevas ventas.
          </Typography>
        </Alert>
      )}

      {/* Tabla de ventas */}
      <Card sx={{ mb: 4, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
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
                {ventas.map((v) => {
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
                          {v.items}
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
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!ventas.length && (
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
        )}
      </Card>

      {/* Tarjetas resumen */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 3,
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
              Ventas no confirmadas
            </Typography>
            <Typography variant="h3" color="warning.main">
              {resumen.pendientes}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {fmtMoney(resumen.pendientesMonto)} en proceso
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
