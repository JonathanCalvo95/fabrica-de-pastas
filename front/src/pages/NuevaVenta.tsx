import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
} from '@mui/material';
import { Add, Delete, ArrowBack, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ProductoVenta {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

const productosDisponibles = [
  { id: 1, nombre: 'Muzzarella x 500g', precio: 1250, stock: 50 },
  { id: 2, nombre: 'Muzzarella x 1kg', precio: 2400, stock: 30 },
  { id: 3, nombre: 'Sardo x 500g', precio: 1800, stock: 25 },
  { id: 4, nombre: 'Provolone x 500g', precio: 1950, stock: 20 },
  { id: 5, nombre: 'Cremoso x 500g', precio: 1650, stock: 35 },
  { id: 6, nombre: 'Fontina x 500g', precio: 2100, stock: 15 },
];

const clientes = [
  'Restaurant La Nonna',
  'Pizzería Don Luigi',
  'Mercado Central',
  'Casa de Pasta María',
  'Supermercado El Ahorro',
  'Restaurant Bella Italia',
];

export default function NuevaVenta() {
  const navigate = useNavigate();
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [cliente, setCliente] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');

  // Estado de caja (simulado)
  const cajaAbierta = true;
  const sesionCajaId = 3;

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    const productoExistente = productosVenta.find(
      (p) => p.id === productoSeleccionado.id
    );

    if (productoExistente) {
      setProductosVenta(
        productosVenta.map((p) =>
          p.id === productoSeleccionado.id
            ? {
                ...p,
                cantidad: p.cantidad + cantidad,
                subtotal: (p.cantidad + cantidad) * p.precio,
              }
            : p
        )
      );
    } else {
      setProductosVenta([
        ...productosVenta,
        {
          id: productoSeleccionado.id,
          nombre: productoSeleccionado.nombre,
          precio: productoSeleccionado.precio,
          cantidad: cantidad,
          subtotal: productoSeleccionado.precio * cantidad,
        },
      ]);
    }

    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const handleEliminarProducto = (id: number) => {
    setProductosVenta(productosVenta.filter((p) => p.id !== id));
  };

  const handleActualizarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      handleEliminarProducto(id);
      return;
    }

    setProductosVenta(
      productosVenta.map((p) =>
        p.id === id
          ? {
              ...p,
              cantidad: nuevaCantidad,
              subtotal: p.precio * nuevaCantidad,
            }
          : p
      )
    );
  };

  const calcularTotal = () => {
    return productosVenta.reduce((sum, p) => sum + p.subtotal, 0);
  };

  const handleFinalizarVenta = () => {
    if (productosVenta.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }
    if (!cliente) {
      alert('Debe seleccionar un cliente');
      return;
    }
    if (!metodoPago) {
      alert('Debe seleccionar un método de pago');
      return;
    }

    // Aquí iría la lógica para guardar la venta
    console.log('Venta finalizada:', {
      cliente,
      metodoPago,
      productos: productosVenta,
      total: calcularTotal(),
      observaciones,
      sesionCajaId: metodoPago === 'Efectivo' ? sesionCajaId : null,
    });

    alert('Venta registrada exitosamente');
    navigate('/ventas');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <IconButton onClick={() => navigate('/ventas')}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h1" sx={{ mb: 0.5 }}>
            Nueva Venta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registrar una nueva transacción
          </Typography>
        </Box>
      </Box>

      {!cajaAbierta && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Atención:</strong> Debe abrir una caja antes de registrar ventas en efectivo
          </Typography>
        </Alert>
      )}

      {cajaAbierta && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Sesión de Caja Activa:</strong> #{sesionCajaId} - Las ventas en efectivo se registrarán automáticamente
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCart />
                Agregar Productos
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Autocomplete
                  sx={{ flex: 1 }}
                  options={productosDisponibles}
                  getOptionLabel={(option) => `${option.nombre} - $${option.precio}`}
                  value={productoSeleccionado}
                  onChange={(_, newValue) => setProductoSeleccionado(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Buscar producto" />
                  )}
                />
                <TextField
                  type="number"
                  label="Cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  sx={{ width: 120 }}
                  inputProps={{ min: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAgregarProducto}
                  disabled={!productoSeleccionado}
                  startIcon={<Add />}
                  sx={{ height: 56 }}
                >
                  Agregar
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Producto</strong></TableCell>
                    <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                    <TableCell align="center"><strong>Cantidad</strong></TableCell>
                    <TableCell align="right"><strong>Subtotal</strong></TableCell>
                    <TableCell align="center"><strong>Acción</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosVenta.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                          No hay productos agregados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosVenta.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>{producto.nombre}</TableCell>
                        <TableCell align="right">
                          ${producto.precio.toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={producto.cantidad}
                            onChange={(e) =>
                              handleActualizarCantidad(
                                producto.id,
                                Number(e.target.value)
                              )
                            }
                            sx={{ width: 80 }}
                            inputProps={{ min: 0 }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            ${producto.subtotal.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleEliminarProducto(producto.id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Resumen de Venta
              </Typography>

              <Autocomplete
                options={clientes}
                value={cliente}
                onChange={(_, newValue) => setCliente(newValue || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" required />
                )}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Método de Pago *</InputLabel>
                <Select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  label="Método de Pago *"
                >
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="Cuenta Corriente">Cuenta Corriente</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Items:</Typography>
                  <Typography fontWeight={500}>
                    {productosVenta.reduce((sum, p) => sum + p.cantidad, 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h5" color="primary" fontWeight={700}>
                    ${calcularTotal().toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleFinalizarVenta}
                disabled={productosVenta.length === 0 || !cajaAbierta}
                sx={{ mt: 2 }}
              >
                Finalizar Venta
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/ventas')}
                sx={{ mt: 1 }}
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
