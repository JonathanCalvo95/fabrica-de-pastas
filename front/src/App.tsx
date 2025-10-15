import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { theme } from "./theme/Theme";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Stock from './pages/Stock';
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
