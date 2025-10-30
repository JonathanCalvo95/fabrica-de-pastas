import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { theme } from "./theme/Theme";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./AppLayout";

import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Ventas from "./pages/Ventas";
import CrearVenta from "./pages/CrearVenta";
import DetalleVenta from "./pages/DetalleVenta";
import Stock from "./pages/Stock";
import Caja from "./pages/Caja";
import Precios from "./pages/Precios";
import Login from "./pages/Login";

import { NotFound, Unauthorized, Forbidden, ServerError } from "./errors";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Precios*/}
          <Route path="/" element={<Navigate to="/precios/1" replace />} />
          <Route path="/precios/:n" element={<Precios />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<Productos />} />
              <Route path="ventas" element={<Ventas />} />
              <Route path="ventas/crear" element={<CrearVenta />} />
              <Route path="ventas/:id" element={<DetalleVenta />} />
              <Route path="stock" element={<Stock />} />
              <Route path="caja" element={<Caja />} />
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
