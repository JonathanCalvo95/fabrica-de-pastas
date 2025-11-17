import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { theme } from "./theme/Theme";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import AppLayout from "./AppLayout";

import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Ventas from "./pages/Ventas";
import CrearVenta from "./pages/CrearVenta";
import DetalleVenta from "./pages/DetalleVenta";
import Pedidos from "./pages/Pedidos";
import CrearPedido from "./pages/CrearPedido";
import DetallePedido from "./pages/DetallePedido";
import Stock from "./pages/Stock";
import Caja from "./pages/Caja";
import Precios from "./pages/Precios";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";

import { NotFound, Unauthorized, Forbidden, ServerError } from "./errors";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Precios*/}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/precios/:n" element={<Precios />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                path="dashboard"
                element={<ProtectedRoute allowedRoles={["Administrador"]} />}
              >
                <Route index element={<Dashboard />} />
              </Route>

              <Route
                path="productos"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Productor"]}
                  />
                }
              >
                <Route index element={<Productos />} />
              </Route>

              <Route
                path="ventas"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Vendedor"]}
                  />
                }
              >
                <Route index element={<Ventas />} />
              </Route>

              <Route
                path="pedidos"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Vendedor"]}
                  />
                }
              >
                <Route index element={<Pedidos />} />
              </Route>

              <Route
                path="ventas/crear"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Vendedor"]}
                  />
                }
              >
                <Route index element={<CrearVenta />} />
              </Route>

              <Route
                path="pedidos/crear"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Vendedor"]}
                  />
                }
              >
                <Route index element={<CrearPedido />} />
              </Route>

              <Route
                path="ventas/:id"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Vendedor"]}
                  />
                }
              >
                <Route index element={<DetalleVenta />} />
              </Route>

              <Route
                path="pedidos/:id"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Vendedor"]}
                  />
                }
              >
                <Route index element={<DetallePedido />} />
              </Route>

              <Route
                path="stock"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Productor"]}
                  />
                }
              >
                <Route index element={<Stock />} />
              </Route>

              <Route
                path="caja"
                element={
                  <ProtectedRoute
                    allowedRoles={["Administrador", "Vendedor"]}
                  />
                }
              >
                <Route index element={<Caja />} />
              </Route>

              <Route
                path="usuarios"
                element={<ProtectedRoute allowedRoles={["Administrador"]} />}
              >
                <Route index element={<Usuarios />} />
              </Route>
            </Route>
          </Route>

          {/* errores */}
          <Route path="/error">
            <Route path="401" element={<Unauthorized />} />
            <Route path="403" element={<Forbidden />} />
            <Route path="500" element={<ServerError />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
