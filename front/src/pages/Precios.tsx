import { Box, Typography, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const categorias = [
  {
    name: 'RAVIOLES',
    productos: [
      { name: 'POLLO Y VERDURA', price: '$ 4.500' },
      { name: 'VERDURA SOLA', price: '$ 4.300' },
      { name: 'CARNE Y VERDURA', price: '$ 4.600' },
      { name: 'POLLO Y JAMON', price: '$ 4.700' },
      { name: 'RICOTA', price: '$ 4.200' },
      { name: 'RICOTA Y QUESO', price: '$ 4.400' },
      { name: 'RICOTA Y JAMON', price: '$ 4.500' },
      { name: 'RICOTA Y VERDURA', price: '$ 4.450' },
      { name: 'RICOTA Y NUEZ', price: '$ 4.800' },
      { name: 'RICOTA, JAMON Y MUZZARELLA', price: '$ 4.900' },
      { name: 'SESOS Y ESPINACA', price: '$ 5.200' },
      { name: 'PAVITA', price: '$ 4.600' },
      { name: 'CASERITOS', price: '$ 4.350' },
      { name: 'RICOTA Y ROQUEFORT', price: '$ 5.100' },
      { name: 'RICOTA, ROQUEFORT Y SBRINZ', price: '$ 5.400' },
      { name: 'A LOS CUATRO QUESOS', price: '$ 5.500' },
    ],
  },
  {
    name: 'CANELONES',
    productos: [
      { name: 'MASA COMUN O PANQUEQUE', price: '$ 4.200' },
      { name: 'POLLO Y VERDURA', price: '$ 4.500' },
      { name: 'VERDURA SOLA', price: '$ 4.300' },
      { name: 'VERDURA, MUZZARELLA Y JAMON', price: '$ 4.700' },
      { name: 'VERDURA Y RICOTA', price: '$ 4.400' },
      { name: 'POLLO Y JAMON', price: '$ 4.600' },
      { name: 'POLLO TROZADO Y JAMON', price: '$ 4.800' },
      { name: 'RICOTA', price: '$ 4.200' },
      { name: 'RICOTA Y JAMON', price: '$ 4.500' },
      { name: 'RICOTA Y NUEZ', price: '$ 4.800' },
      { name: 'RICOTA, JAMON Y NUEZ', price: '$ 4.900' },
      { name: 'RICOTA, JAMON Y MUZZARELLA', price: '$ 5.000' },
      { name: 'RICOTA CON ROQUEFORT', price: '$ 5.200' },
    ],
  },
];

export default function Precios1() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/precios2');
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F5ECD7',
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            mb: 4,
            fontWeight: 'bold',
            color: '#2C1810',
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          LISTA DE PRECIOS
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
          {categorias.map((categoria) => (
            <Paper
              key={categoria.name}
              elevation={4}
              sx={{
                border: '4px solid #3E2723',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: '#FAFAFA',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  bgcolor: '#3E2723',
                  color: 'white',
                  py: 1.5,
                  px: 2,
                  textAlign: 'center',
                  borderBottom: '3px solid #3E2723',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    letterSpacing: 0.5,
                  }}
                >
                  {categoria.name}
                </Typography>
              </Box>

              <Box sx={{ bgcolor: 'white' }}>
                {categoria.productos.map((producto, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      px: 2,
                      borderBottom: idx < categoria.productos.length - 1 ? '2px solid #8D6E63' : 'none',
                      minHeight: 40,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                        fontWeight: 600,
                        color: '#C62828',
                        textTransform: 'uppercase',
                        letterSpacing: 0.3,
                        flex: 1,
                        pr: 1,
                      }}
                    >
                      {producto.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                        fontWeight: 'bold',
                        color: '#2C1810',
                        bgcolor: '#8D6E63',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 0.5,
                        minWidth: 70,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {producto.price}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
