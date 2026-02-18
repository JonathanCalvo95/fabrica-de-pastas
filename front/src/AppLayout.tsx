import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { SidebarProvider } from "./context/SidebarContext";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
          position: "relative",
          overflow: "hidden",

          "&::before": {
            content: '""',
            position: "fixed",
            pointerEvents: "none",
            width: 900,
            height: 900,
            borderRadius: "50%",
            top: -260,
            left: -200,
            background: (t) =>
              `radial-gradient(circle at center, ${alpha(
                t.palette.secondary.main,
                0.2
              )} 0)`,
            zIndex: 0,
          },
          "&::after": {
            content: '""',
            position: "fixed",
            pointerEvents: "none",
            width: 900,
            height: 900,
            borderRadius: "50%",
            bottom: -320,
            right: -220,
            background: (t) =>
              `radial-gradient(circle at center, ${alpha(
                t.palette.secondary.main,
                0.2
              )} 0)`,
            zIndex: 0,
          },
        }}
      >
        <Navbar />

        <Box
          sx={{
            display: "flex",
            flex: 1,
            minHeight: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Sidebar />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflow: "auto",
            }}
          >
            {/* Contenedor central */}
            <Box
              sx={{
                maxWidth: 1360,
                mx: "auto",
                p: 4,
                pb: 6,
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>

        <Footer />
      </Box>
    </SidebarProvider>
  );
}
