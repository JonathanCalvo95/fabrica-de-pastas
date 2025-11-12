import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { SidebarProvider } from "./context/SidebarContext";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />
        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
            <Outlet />
          </Box>
        </Box>
        <Footer />
      </Box>
    </SidebarProvider>
  );
}
