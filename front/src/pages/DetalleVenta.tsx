import { useParams, useNavigate } from 'react-router-dom';
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
  Grid
} from '@mui/material';
import { ArrowBack, Print, Edit } from '@mui/icons-material';

const ventasData = [
  {
    id: 1,
    date: '2025-10-14',
    time: '10:30',
    client: 'Restaurant La Nonna',
    payment: 'Transferencia',
    status: 'completed',
    productos: [
      { nombre: 'Muzzarella x 1kg', cantidad: 3, precioUnit: 2400, subtotal: 7200 },
      { nombre: 'Sardo x 500g', cantidad: 1, precioUnit: 1800, subtotal: 1800 },
    ],
    total: 8750,
    observaciones: 'Entregar antes de las 12:00',
    sesionCaja: 3,
  },
  {
    id: 2,
    date: '2025-10-14',
    time: '09:15',
    client: 'Pizzería Don Luigi',
    payment: 'Efectivo',
    status: 'completed',
    productos: [
      { nombre: 'Muzzarella x 500g', cantidad: 2, precioUnit: 1250, subtotal: 2500 },
      { nombre: 'Provolone x 500g', cantidad: 1, precioUnit: 1950, subtotal: 1950 },
    ],
    total: 4200,
    observaciones: '',
    sesionCaja: 3,
  },
  {
    id: 3,
    date: '2025-10-13',
    time: '16:45',
    client: 'Mercado Central',
    payment: 'Cuenta Corriente',
    status: 'pending',
    productos: [
      { nombre: 'Muzzarella x 1kg', cantidad: 4, precioUnit: 2400, subtotal: 9600 },
      { nombre: 'Cremoso x 500g', cantidad: 2, precioUnit: 1650, subtotal: 3300 },
    ],
    total: 12500,
    observaciones: 'Pago a 30 días',
    sesionCaja: null,
  },
  {
    id: 4,
    date: '2025-10-13',
    time: '14:20',
    client: 'Casa de Pasta María',
    payment: 'Transferencia',
    status: 'completed',
    productos: [
      { nombre: 'Fontina x 500g', cantidad: 2, precioUnit: 2100, subtotal: 4200 },
      { nombre: 'Sardo x 500g', cantidad: 1, precioUnit: 1800, subtotal: 1800 },
    ],
    total: 5800,
    observaciones: '',
    sesionCaja: 2,
  },
  {
    id: 5,
    date: '2025-10-13',
    time: '11:00',
    client: 'Supermercado El Ahorro',
    payment: 'Cheque',
    status: 'completed',
    productos: [
      { nombre: 'Muzzarella x 1kg', cantidad: 5, precioUnit: 2400, subtotal: 12000 },
      { nombre: 'Provolone x 500g', cantidad: 3, precioUnit: 1950, subtotal: 5850 },
      { nombre: 'Cremoso x 500g', cantidad: 1, precioUnit: 1650, subtotal: 1650 },
    ],
    total: 18900,
    observaciones: 'Cheque a 60 días',
    sesionCaja: null,
  },
  {
    id: 6,
    date: '2025-10-12',
    time: '15:30',
    client: 'Restaurant Bella Italia',
    payment: 'Efectivo',
    status: 'completed',
    productos: [
      { nombre: 'Muzzarella x 1kg', cantidad: 3, precioUnit: 2400, subtotal: 7200 },
      { nombre: 'Fontina x 500g', cantidad: 1, precioUnit: 2100, subtotal: 2100 },
    ],
    total: 9200,
    observaciones: '',
    sesionCaja: 2,
  },
];

const getStatusChip = (status: string) => {
  if (status === 'completed') {
    return <Chip label="Completada" color="success" size="small" />;
  }
  return <Chip label="Pendiente" color="warning" size="small" />;
};

export default function DetalleVentaMUI() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const venta = ventasData.find((v) => v.id === Number(id));

  if (!venta) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Venta no encontrada</Alert>
        <Button onClick={() => navigate('/ventas')} sx={{ mt: 2 }}>
          Volver a Ventas
        </Button>
      </Box>
    );
  }

  const handleImprimir = () => {
    window.print();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/ventas')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h1" sx={{ mb: 0.5 }}>
              Detalle de Venta #{id?.padStart(4, '0')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {venta.date} a las {venta.time}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Print />} onClick={handleImprimir}>
            Imprimir
          </Button>
          {venta.status === 'pending' && (
            <Button variant="outlined" startIcon={<Edit />} color="warning">
              Editar
            </Button>
          )}
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
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Producto</strong></TableCell>
                      <TableCell align="center"><strong>Cantidad</strong></TableCell>
                      <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                      <TableCell align="right"><strong>Subtotal</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {venta.productos.map((producto, index) => (
                      <TableRow key={index}>
                        <TableCell>{producto.nombre}</TableCell>
                        <TableCell align="center">{producto.cantidad}</TableCell>
                        <TableCell align="right">
                          ${producto.precioUnit.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            ${producto.subtotal.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h5" color="primary" fontWeight={700}>
                          ${venta.total.toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {venta.observaciones && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Observaciones
                </Typography>
                <Typography color="text.secondary">{venta.observaciones}</Typography>
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Cliente
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {venta.client}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Método de Pago
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {venta.payment}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Estado
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {getStatusChip(venta.status)}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Items Totales
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {venta.productos.reduce((sum, p) => sum + p.cantidad, 0)} unidades
                </Typography>
              </Box>

              {venta.sesionCaja && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Sesión de Caja
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      #{venta.sesionCaja}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumen
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal:</Typography>
                <Typography fontWeight={600}>
                  ${venta.total.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Impuestos:</Typography>
                <Typography fontWeight={600}>$0</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h5" color="primary" fontWeight={700}>
                  ${venta.total.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
