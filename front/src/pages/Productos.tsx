import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

const productos = [
  {
    id: 1,
    name: "Ravioles de Ricota",
    category: "Rellenos",
    price: 450,
    stock: 45,
    unit: "kg",
    status: "active",
  },
  {
    id: 2,
    name: "Ñoquis de Papa",
    category: "Pastas Frescas",
    price: 350,
    stock: 8,
    unit: "kg",
    status: "active",
  },
  {
    id: 3,
    name: "Tallarines al Huevo",
    category: "Pastas Frescas",
    price: 380,
    stock: 67,
    unit: "kg",
    status: "active",
  },
  {
    id: 4,
    name: "Sorrentinos de Jamón y Queso",
    category: "Rellenos",
    price: 490,
    stock: 34,
    unit: "kg",
    status: "active",
  },
  {
    id: 5,
    name: "Capeletis de Verdura",
    category: "Rellenos",
    price: 470,
    stock: 15,
    unit: "kg",
    status: "active",
  },
  {
    id: 6,
    name: "Lasagna",
    category: "Preparados",
    price: 850,
    stock: 23,
    unit: "unidad",
    status: "active",
  },
];

export default function Productos() {
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
            Productos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tu catálogo de productos
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>
          Nuevo Producto
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {productos.map((producto) => (
          <Card key={producto.id} sx={{ "&:hover": { boxShadow: 6 } }}>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {producto.name}
                  </Typography>
                  <Chip
                    label={producto.category}
                    size="small"
                    color="secondary"
                  />
                </Box>
                <Box>
                  <IconButton size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box
                sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Precio de Venta
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    ${producto.price}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Stock
                  </Typography>
                  <Typography
                    fontWeight={500}
                    sx={{
                      color:
                        producto.stock < 20 ? "error.main" : "success.main",
                    }}
                  >
                    {producto.stock} {producto.unit}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
