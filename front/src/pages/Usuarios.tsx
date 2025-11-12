import {
  Box,
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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  LinearProgress,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Edit,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  setUsuarioActivo,
} from "../api/usuarios";
import type { Usuario } from "../api/usuarios";
import { TIPO_ROL_OPTIONS, tipoRolLabel, tipoRolColor } from "../utils/enums";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<Usuario | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });
  const notify = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => setSnack({ open: true, message, severity });
  const [formData, setFormData] = useState<
    Partial<Usuario> & { nuevaClave?: string }
  >({ nombre: "", rol: 1, activo: true, nuevaClave: "" });

  const refresh = async () => {
    const data = await getUsuarios();
    setUsuarios(data);
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (e) {
        console.error(e);
        notify("Error al cargar los usuarios", "error");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const handleOpenCreate = () => {
    setFormData({ nombre: "", rol: 3, activo: true, nuevaClave: "" });
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    if (!formData.nombre) return;
    setLoadingCreate(true);
    try {
      await crearUsuario({
        usuario: formData.nombre,
        clave: formData.nuevaClave || "1234",
        rol: Number(formData.rol ?? 3),
      });
      await refresh();
      setOpenCreate(false);
      notify("Usuario creado");
    } catch (err) {
      console.error(err);
      notify("Error creando usuario", "error");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleOpenEdit = (u: Usuario) => {
    setOpenEdit(u);
    setFormData({ ...u, nuevaClave: "" });
  };

  const handleEdit = async () => {
    if (!openEdit) return;
    setLoadingEdit(true);
    try {
      await actualizarUsuario(openEdit.id, {
        nombre:
          formData.nombre !== openEdit.nombre ? formData.nombre : undefined,
        nuevaClave: formData.nuevaClave ? formData.nuevaClave : undefined,
        rol:
          Number(formData.rol) !== Number(openEdit.rol)
            ? Number(formData.rol)
            : undefined,
        activo:
          typeof formData.activo === "boolean" &&
          formData.activo !== openEdit.activo
            ? formData.activo
            : undefined,
      });
      await refresh();
      setOpenEdit(null);
      notify("Usuario actualizado");
    } catch (err) {
      console.error(err);
      notify("Error actualizando usuario", "error");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleToggleActivo = async (u: Usuario) => {
    setLoadingToggleId(u.id);
    try {
      await setUsuarioActivo(u.id, !u.activo);
      await refresh();
      notify(`Usuario ${!u.activo ? "activado" : "desactivado"}`);
    } catch (err) {
      console.error(err);
      notify("Error cambiando estado", "error");
    } finally {
      setLoadingToggleId(null);
    }
  };

  const formatFecha = (iso?: string) => (iso ? iso.slice(0, 10) : "");

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los usuarios del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Nuevo Usuario
        </Button>
      </Box>
      {initialLoading && <LinearProgress sx={{ mb: 2 }} />}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Creación</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => {
              const toggling = loadingToggleId === u.id;
              return (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <Person />
                      </Avatar>
                      <Typography fontWeight={500}>{u.nombre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tipoRolLabel(Number(u.rol))}
                      color={tipoRolColor(Number(u.rol)) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.activo ? "Activo" : "Inactivo"}
                      color={u.activo ? "success" : "default"}
                      size="small"
                      onClick={() => handleToggleActivo(u)}
                      sx={{ cursor: "pointer" }}
                      icon={
                        toggling ? (
                          <CircularProgress size={14} sx={{ ml: 0.5 }} />
                        ) : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>{formatFecha(u.fechaCreacion)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(u)}
                      disabled={toggling}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {usuarios.length === 0 && !initialLoading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 4 }}
                  >
                    No hay usuarios cargados.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        <DialogContent>
          <FormularioUsuario
            formData={formData}
            setFormData={setFormData}
            isEdit={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)} disabled={loadingCreate}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={loadingCreate}
          >
            {loadingCreate && <CircularProgress size={18} sx={{ mr: 1 }} />}
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!openEdit}
        onClose={() => setOpenEdit(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <FormularioUsuario
            formData={formData}
            setFormData={setFormData}
            isEdit={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(null)} disabled={loadingEdit}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEdit}
            disabled={loadingEdit}
          >
            {loadingEdit && <CircularProgress size={18} sx={{ mr: 1 }} />}
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function FormularioUsuario({
  formData,
  setFormData,
  isEdit,
}: {
  formData: Partial<Usuario> & { nuevaClave?: string };
  setFormData: (f: Partial<Usuario> & { nuevaClave?: string }) => void;
  isEdit: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      <TextField
        label="Nombre de usuario"
        value={formData.nombre ?? ""}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        fullWidth
        required
      />
      <TextField
        select
        label="Rol"
        value={Number(formData.rol ?? 3)}
        onChange={(e) =>
          setFormData({ ...formData, rol: Number(e.target.value) })
        }
        fullWidth
      >
        {TIPO_ROL_OPTIONS.map((r) => (
          <MenuItem key={r.value} value={r.value}>
            {r.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Estado"
        value={(formData.activo ?? true) ? "true" : "false"}
        onChange={(e) =>
          setFormData({ ...formData, activo: e.target.value === "true" })
        }
        fullWidth
      >
        <MenuItem value="true">Activo</MenuItem>
        <MenuItem value="false">Inactivo</MenuItem>
      </TextField>
      <TextField
        label={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
        type={showPassword ? "text" : "password"}
        value={formData.nuevaClave ?? ""}
        onChange={(e) =>
          setFormData({ ...formData, nuevaClave: e.target.value })
        }
        fullWidth
        required={!isEdit}
        placeholder={isEdit ? "Dejar vacío para no cambiar" : ""}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
