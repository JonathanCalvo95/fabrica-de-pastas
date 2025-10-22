import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { get, post, put, del, type Producto } from "../api/productos";

// helpers para enums
const medidaLabel = (u: number) =>
  ({ 0: "kg", 1: "unidad", 2: "litro" })[u] ?? String(u);
const categoriaLabel = (t: number) =>
  ({ 0: "Rellenos", 1: "Pastas Frescas", 2: "Preparados", 3: "Salsas" })[t] ??
  String(t);

const MIN_STOCK_UI = 10;

export default function Productos() {
  // estado principal
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // diálogos y formulario
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<Producto | null>(null);
  const [openDelete, setOpenDelete] = useState<Producto | null>(null);

  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: "",
    descripcion: "",
    precio: 0,
    medida: 0,
    stock: 0,
    categoria: 0,
    activo: true,
  });

  // cargar datos
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await get();
        if (mounted) setProductos(data);
      } catch (e: any) {
        setError(e?.response?.data ?? "Error al cargar productos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // handlers
  const handleOpenCreate = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      medida: 0,
      stock: 0,
      categoria: 0,
      activo: true,
    });
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    try {
      const creado = await post(formData);
      setProductos((prev) => [creado, ...prev]);
      setOpenCreate(false);
    } catch (e: any) {
      alert(e?.response?.data ?? "No se pudo crear el producto");
    }
  };

  const handleOpenEdit = (p: Producto) => {
    setOpenEdit(p);
    setFormData(p);
  };

  const handleEdit = async () => {
    if (!openEdit) return;
    try {
      await put(openEdit.id, formData);
      setProductos((prev) =>
        prev.map((x) =>
          x.id === openEdit.id ? ({ ...x, ...formData } as Producto) : x
        )
      );
      setOpenEdit(null);
    } catch (e: any) {
      alert(e?.response?.data ?? "No se pudo actualizar el producto");
    }
  };

  const handleDelete = async () => {
    if (!openDelete) return;
    try {
      await del(openDelete.id);
      setProductos((prev) => prev.filter((x) => x.id !== openDelete.id));
      setOpenDelete(null);
    } catch (e: any) {
      alert(e?.response?.data ?? "No se pudo eliminar el producto");
    }
  };

  // UI estados
  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Cargando productos…</Typography>
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

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
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Productos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de productos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
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
        {productos.map((p) => (
          <Card key={p.id} sx={{ "&:hover": { boxShadow: 6 } }}>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {p.nombre}
                  </Typography>
                  <Chip
                    label={categoriaLabel(p.categoria)}
                    size="small"
                    color="secondary"
                  />
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenEdit(p)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setOpenDelete(p)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {p.stock < MIN_STOCK_UI && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Stock bajo mínimo ({MIN_STOCK_UI} {medidaLabel(p.medida)})
                </Alert>
              )}

              <Box
                sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Precio de Venta
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    ${p.precio}
                  </Typography>
                </Box>

                <Row
                  label="Stock Actual"
                  value={`${p.stock}`}
                  color={p.stock < MIN_STOCK_UI ? "error.main" : "success.main"}
                />
                <Row label="Unidad" value={medidaLabel(p.medida)} />

                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    {p.descripcion}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Crear */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Producto</DialogTitle>
        <DialogContent>
          <Form formData={formData} setFormData={setFormData} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editar */}
      <Dialog
        open={!!openEdit}
        onClose={() => setOpenEdit(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent>
          <Form formData={formData} setFormData={setFormData} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEdit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Eliminar */}
      <Dialog
        open={!!openDelete}
        onClose={() => setOpenDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar Producto</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Eliminar <strong>{openDelete?.nombre}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// UI helpers
function Row({
  label,
  value,
  strong,
  color,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  color?: string;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        sx={{ fontWeight: strong ? 600 : 500, ...(color ? { color } : {}) }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function Form({
  formData,
  setFormData,
}: {
  formData: Partial<Producto>;
  setFormData: (f: Partial<Producto>) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      <TextField
        label="Nombre"
        value={formData.nombre ?? ""}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        fullWidth
      />
      <TextField
        label="Descripción"
        value={formData.descripcion ?? ""}
        onChange={(e) =>
          setFormData({ ...formData, descripcion: e.target.value })
        }
        fullWidth
      />
      <TextField
        label="Precio"
        type="number"
        value={formData.precio ?? 0}
        onChange={(e) =>
          setFormData({ ...formData, precio: Number(e.target.value) })
        }
        fullWidth
      />
      <TextField
        label="Stock"
        type="number"
        value={formData.stock ?? 0}
        onChange={(e) =>
          setFormData({ ...formData, stock: Number(e.target.value) })
        }
        fullWidth
      />
      <TextField
        select
        label="Unidad"
        value={formData.medida ?? 0}
        onChange={(e) =>
          setFormData({ ...formData, medida: Number(e.target.value) })
        }
        fullWidth
      >
        {[0, 1, 2].map((v) => (
          <MenuItem key={v} value={v}>
            {medidaLabel(v)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Categoria"
        value={formData.categoria ?? 0}
        onChange={(e) =>
          setFormData({ ...formData, categoria: Number(e.target.value) })
        }
        fullWidth
      >
        {[0, 1, 2, 3].map((v) => (
          <MenuItem key={v} value={v}>
            {categoriaLabel(v)}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
