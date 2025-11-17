import { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Add, Visibility } from "@mui/icons-material";
import { list, type PedidoListItem } from "../api/pedidos";
import { getUsuarios, type Usuario } from "../api/usuarios";
import { getUserRole } from "../utils/auth";
import { estadoPedidoInfo } from "../utils/enums";

const money = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

export default function Pedidos() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PedidoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await list();
        setRows(data);
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
    })();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h1">Pedidos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/pedidos/crear")}>Nuevo Pedido</Button>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                    <TableCell align="left"><strong>Estado</strong></TableCell>
                    <TableCell align="center"><strong>Acción</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No hay pedidos</TableCell>
                    </TableRow>
                  ) : rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{new Date(r.fecha).toLocaleString("es-AR")}</TableCell>
                      <TableCell>{r.cliente ?? "-"}</TableCell>
                      <TableCell>{r.usuarioId ? (usersMap[r.usuarioId] ?? `#${r.usuarioId.slice(-6)}`) : "-"}</TableCell>
                      <TableCell align="right">{money(r.total)}</TableCell>
                      <TableCell align="left">
                        {(() => { const est = estadoPedidoInfo(r.estado); return <Chip label={est.label} color={est.color as any} size="small"/> })()}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => navigate(`/pedidos/${r.id}`)}>
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
