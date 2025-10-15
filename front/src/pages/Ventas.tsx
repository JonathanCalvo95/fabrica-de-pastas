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
} from "@mui/material";
import { Add, Visibility } from "@mui/icons-material";

const ventas = [
  {
    id: 1,
    date: "2025-10-14",
    time: "10:30",
    items: 5,
    total: 8750,
    status: "completed",
    payment: "Transferencia",
  },
  {
    id: 2,
    date: "2025-10-14",
    time: "09:15",
    items: 3,
    total: 4200,
    status: "completed",
    payment: "Efectivo",
  },
  {
    id: 3,
    date: "2025-10-13",
    time: "16:45",
    items: 8,
    total: 12500,
    status: "pending",
    payment: "Cuenta Corriente",
  },
  {
    id: 4,
    date: "2025-10-13",
    time: "14:20",
    items: 4,
    total: 5800,
    status: "completed",
    payment: "Transferencia",
  },
  {
    id: 5,
    date: "2025-10-13",
    time: "11:00",
    items: 12,
    total: 18900,
    status: "completed",
    payment: "Cheque",
  },
  {
    id: 6,
    date: "2025-10-12",
    time: "15:30",
    items: 6,
    total: 9200,
    status: "completed",
    payment: "Efectivo",
  },
];

const getStatusChip = (status: string) => {
  if (status === "completed") {
    return <Chip label="Completada" color="success" size="small" />;
  }
  return <Chip label="Pendiente" color="warning" size="small" />;
};

export default function Ventas() {
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
            Ventas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registro de todas las transacciones
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>
          Nueva Venta
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
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
                <TableCell>
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ventas.map((venta) => (
                <TableRow
                  key={venta.id}
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontFamily="monospace"
                    >
                      #{venta.id.toString().padStart(4, "0")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{venta.date}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {venta.time}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="text.secondary">
                      {venta.items}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      ${venta.total.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(venta.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{venta.payment}</Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

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
              $12,950
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              +8 ventas
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Promedio por Venta
            </Typography>
            <Typography variant="h3">$9,725</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Ventas Pendientes
            </Typography>
            <Typography variant="h3" color="warning.main">
              1
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              $12,500 en proceso
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
