import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert as MuiAlert,
  Alert,
  InputLabel,
  TextField,
  CardContent,
  TablePagination,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import { Add, Visibility, ShoppingCart, Receipt } from "@mui/icons-material";
import { list, updateEstado, generarVenta, type PedidoListItem, type EstadoPedido, type MetodoPago } from "../api/pedidos";
import { getUsuarios, type Usuario } from "../api/usuarios";
import { getCajaActual, type CajaDto } from "../api/caja";
import { getUserRole } from "../utils/auth";

const money = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const formatFecha = (fecha: string) => {
  const date = new Date(fecha);
  const f = date.toLocaleDateString("es-AR");
  const h = date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { fecha: f, hora: h };
};

const getEstadoColor = (estado: EstadoPedido): "warning" | "info" | "success" | "error" => {
  switch (estado) {
    case 1: return "warning";  // Pendiente - amarillo
    case 2: return "info";     // Confirmado - azul
    case 3: return "success";  // Entregado - verde
    case 4: return "error";    // Cancelado - rojo
    default: return "info";
  }
};

const sortByEstado = (a: PedidoListItem, b: PedidoListItem) => {
  // Orden: Pendiente (1), Confirmado (2), Entregado (3), Cancelado (4)
  return a.estado - b.estado;
};

// Reglas de transición de estados
const getEstadosPermitidos = (estadoActual: EstadoPedido, hayCajaAbierta: boolean, tieneVenta: boolean): EstadoPedido[] => {
  let estados: EstadoPedido[] = [];
  
  switch (estadoActual) {
    case 1: estados = [1, 2, 4]; break; // Pendiente → Pendiente, Confirmado, Cancelado
    case 2: estados = [2, 3, 4]; break; // Confirmado → Confirmado, Entregado, Cancelado
    case 3: estados = [3]; break;       // Entregado → Solo Entregado (no se puede cambiar)
    case 4: estados = [1, 4]; break;    // Cancelado → Pendiente, Cancelado
    default: estados = [estadoActual];
  }
  
  // Si no hay caja abierta, remover estado Entregado salvo que ya esté entregado
  if (!hayCajaAbierta && estadoActual !== 3) {
    estados = estados.filter(e => e !== 3);
  }
  
  // Si no tiene venta generada, remover estado Entregado salvo que ya esté entregado
  if (!tieneVenta && estadoActual !== 3) {
    estados = estados.filter(e => e !== 3);
  }
  
  return estados;
};

export default function Pedidos() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PedidoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [caja, setCaja] = useState<CajaDto | null>(null);

  // Dialog generar venta
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(1);
  const [generatingVenta, setGeneratingVenta] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  const [clienteFiltro, setClienteFiltro] = useState<string>("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | "">("");

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const data = await list();
      // Ordenar por estado: Pendiente primero
      const sortedData = [...data].sort(sortByEstado);
      setRows(sortedData);
      // Sólo admin puede leer usuarios. Intentar mapear nombres si es admin.
      if (getUserRole() === "Administrador") {
        try {
          const usuarios = await getUsuarios();
          const map = Object.fromEntries(usuarios.map((u: Usuario) => [u.id, u.nombre]));
          setUsersMap(map);
        } catch {
          // ignorar errores para roles no autorizados
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
    // Cargar caja actual
    (async () => {
      try {
        const c = await getCajaActual();
        setCaja(c);
      } catch {
        setCaja(null);
      }
    })();
  }, []);

  const handleEstadoChange = async (pedidoId: string, nuevoEstado: EstadoPedido) => {
    // Validar si se intenta cambiar a Entregado sin caja abierta
    if (nuevoEstado === 3 && !caja) {
      setSnack({ 
        open: true, 
        message: "No se puede cambiar a Entregado sin una caja abierta. Debe abrir una caja primero.", 
        severity: "error" 
      });
      return;
    }
    
    // Validar si se intenta cambiar a Entregado sin venta generada
    if (nuevoEstado === 3) {
      const pedido = rows.find(p => p.id === pedidoId);
      if (!pedido?.ventaId) {
        setSnack({ 
          open: true, 
          message: "No se puede marcar como Entregado un pedido sin venta generada. Debe generar primero la venta.", 
          severity: "error" 
        });
        return;
      }
    }
    
    try {
      await updateEstado(pedidoId, nuevoEstado);
      setSnack({ open: true, message: "Estado actualizado correctamente", severity: "success" });
      await loadPedidos();
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? "No se pudo actualizar el estado.";
      setSnack({ open: true, message: msg, severity: "error" });
    }
  };

  const handleOpenGenerarVenta = (pedidoId: string) => {
    if (!caja) {
      setSnack({ open: true, message: "Debe abrir una caja antes de generar ventas", severity: "error" });
      return;
    }
    const pedido = rows.find(p => p.id === pedidoId);
    if (!pedido) {
      setSnack({ open: true, message: "Pedido no encontrado", severity: "error" });
      return;
    }
    if (pedido.estado !== 2) {
      setSnack({ open: true, message: "Solo se puede generar venta si el pedido está Confirmado", severity: "error" });
      return;
    }
    setSelectedPedidoId(pedidoId);
    setMetodoPago(1);
    setDialogOpen(true);
  };

  const handleGenerarVenta = async () => {
    if (!selectedPedidoId) return;

    try {
      setGeneratingVenta(true);
      const result = await generarVenta(selectedPedidoId, metodoPago);
      // Cambiar automáticamente el estado a Entregado
      await updateEstado(selectedPedidoId, 3);
      setSnack({ open: true, message: "Venta generada correctamente", severity: "success" });
      setDialogOpen(false);
      await loadPedidos();
      setTimeout(() => navigate(`/ventas/${result.ventaId}`), 500);
    } catch (e: any) {
      const msg = e?.response?.data ?? e?.message ?? "No se pudo generar la venta.";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setGeneratingVenta(false);
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = useMemo(() => {
    let filtered = [...rows];

    // Filtro por fecha
    if (fechaDesde) {
      const desde = fechaDesde.startOf('day');
      filtered = filtered.filter(p => dayjs(p.fecha).isAfter(desde) || dayjs(p.fecha).isSame(desde, 'day'));
    }
    if (fechaHasta) {
      const hasta = fechaHasta.endOf('day');
      filtered = filtered.filter(p => dayjs(p.fecha).isBefore(hasta) || dayjs(p.fecha).isSame(hasta, 'day'));
    }

    // Filtro por cliente
    if (clienteFiltro.trim()) {
      const search = clienteFiltro.toLowerCase();
      filtered = filtered.filter(p => p.cliente?.toLowerCase().includes(search));
    }

    // Filtro por estado
    if (estadoFiltro !== "") {
      filtered = filtered.filter(p => p.estado === estadoFiltro);
    }

    return filtered;
  }, [rows, fechaDesde, fechaHasta, clienteFiltro, estadoFiltro]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setPage(0);
  }, [fechaDesde, fechaHasta, clienteFiltro, estadoFiltro]);

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
            Pedidos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de pedidos de clientes
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/pedidos/crear")}>Nuevo Pedido</Button>
      </Box>

      {!caja && rows.some(p => p.estado === 2 && !p.ventaId) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Atención:</strong> No hay caja abierta. No se pueden generar ventas ni cambiar pedidos a estado Entregado hasta que se abra una caja.
          </Typography>
        </Alert>
      )}

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
            <TextField
              label="Cliente"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              placeholder="Buscar por nombre..."
              sx={{ minWidth: 200 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFiltro}
                label="Estado"
                onChange={(e) => setEstadoFiltro(e.target.value as EstadoPedido | "")}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value={1}>⚠️ Pendiente</MenuItem>
                <MenuItem value={2}>ℹ️ Confirmado</MenuItem>
                <MenuItem value={3}>✅ Entregado</MenuItem>
                <MenuItem value={4}>❌ Cancelado</MenuItem>
              </Select>
            </FormControl>
            {(fechaDesde || fechaHasta || clienteFiltro || estadoFiltro !== "") && (
              <Button
                variant="outlined"
                onClick={() => {
                  setFechaDesde(null);
                  setFechaHasta(null);
                  setClienteFiltro("");
                  setEstadoFiltro("");
                }}
                sx={{ mt: 1 }}
              >
                Limpiar Filtros
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
          <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="left"><strong>Estado</strong></TableCell>
                    <TableCell align="right"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">{rows.length === 0 ? "No hay pedidos" : "No hay pedidos que coincidan con los filtros"}</TableCell>
                    </TableRow>
                  ) : pedidosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r) => {
                    const { fecha, hora } = formatFecha(r.fecha);
                    return (
                    <TableRow key={r.id} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                      <TableCell>
                        <Typography fontWeight={500}>{fecha}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hora}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          {r.cliente || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          {r.usuarioId ? (usersMap[r.usuarioId] ?? `#${r.usuarioId.slice(-6)}`) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight={600}
                        >
                          {money(r.total)}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={r.estado}
                            onChange={(e) => handleEstadoChange(r.id, e.target.value as EstadoPedido)}
                            disabled={r.estado === 3}
                            sx={{
                              fontSize: "0.875rem",
                              color: `${getEstadoColor(r.estado)}.main`,
                              fontWeight: 600,
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: `${getEstadoColor(r.estado)}.main`,
                                borderWidth: 2,
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: `${getEstadoColor(r.estado)}.dark`,
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: `${getEstadoColor(r.estado)}.main`,
                              },
                            }}
                          >
                            {getEstadosPermitidos(r.estado, caja !== null, !!r.ventaId).map((estado) => {
                              const labels = {
                                1: "⚠️ Pendiente",
                                2: "ℹ️ Confirmado",
                                3: "✅ Entregado",
                                4: "❌ Cancelado"
                              };
                              return (
                                <MenuItem key={estado} value={estado}>
                                  {labels[estado]}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => navigate(`/pedidos/${r.id}`)} size="small" title="Ver detalle">
                          <Visibility />
                        </IconButton>
                        {r.ventaId ? (
                          <Tooltip title="Ver venta generada">
                            <IconButton
                              onClick={() => navigate(`/ventas/${r.ventaId}`)}
                              size="small"
                              color="success"
                            >
                              <Receipt />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={
                              !caja
                                ? "No hay caja abierta"
                                : r.estado !== 2
                                ? "Solo se puede generar venta si está Confirmado"
                                : "Generar venta"
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() => handleOpenGenerarVenta(r.id)}
                                size="small"
                                color="primary"
                                disabled={!caja || r.estado !== 2}
                              >
                                <ShoppingCart />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pedidosFiltrados.length}
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

      {/* Dialog para generar venta */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Generar Venta desde Pedido</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Seleccione el método de pago para la venta
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
            >
              <MenuItem value={1}>Efectivo</MenuItem>
              <MenuItem value={2}>Mercado Pago</MenuItem>
              <MenuItem value={3}>Transferencia</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={generatingVenta}>Cancelar</Button>
          <Button variant="contained" onClick={handleGenerarVenta} disabled={generatingVenta}>
            {generatingVenta ? "Generando..." : "Generar Venta"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
