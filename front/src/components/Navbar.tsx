import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  EggAlt,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../api/dashboard";
import { getCajaActual } from "../api/caja";
import { parseJwt } from "../utils/auth";
import { useSidebarCollapsed } from "../context/SidebarContext";
import { layout } from "../theme/Theme";
import { Link as RouterLink } from "react-router-dom";

interface NavbarProps {
  onHeightChange?: (height: number) => void;
}

interface LowStockItem {
  id: string;
  descripcion: string;
  stock: string;
  stockMinimo: string;
}

export const Navbar = ({ onHeightChange }: NavbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [name, setName] = useState("");
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const navigate = useNavigate();
  const barRef = useRef<HTMLDivElement | null>(null);

  const { collapsed, toggle } = useSidebarCollapsed();
  const drawerWidth = collapsed
    ? layout.DRAWER_WIDTH_COLLAPSED
    : layout.DRAWER_WIDTH;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload = parseJwt(token);
      const n = (payload?.name || payload?.Name) as string | undefined;
      if (typeof n === "string") setName(n);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getDashboard();
        if (mounted) {
          const items: LowStockItem[] = data.lowStock.map(
            (l: any, idx: number) => ({
              id: `${idx}`,
              descripcion: l.descripcion,
              stock: l.stock,
              stockMinimo: l.stockMinimo,
            })
          );
          setLowStock(items);
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const caja = await getCajaActual();
        if (mounted) setCajaAbierta(!!caja && caja.estado === 1);
      } catch {
        if (mounted) setCajaAbierta(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (barRef.current) {
      const h = barRef.current.getBoundingClientRect().height;
      document.body.style.paddingTop = `${h}px`;
      onHeightChange?.(h);
    }
    return () => {
      document.body.style.paddingTop = "0px";
    };
  }, [onHeightChange]);

  const handleMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleNotifMenu = (e: React.MouseEvent<HTMLElement>) =>
    setNotifAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <AppBar
      ref={barRef}
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "primary.main",
        borderBottom: `${layout.BORDER}`,
        borderColor: "divider",
        zIndex: (t) => t.zIndex.drawer + 2,
        boxShadow: "none",
        left: 0,
        width: "100%",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: layout.TOPBAR_HEIGHT,
          pl: `${drawerWidth}px`,
          transition: "padding-left 0.3s ease",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={toggle}
            size="small"
            sx={{ mr: 1, color: "inherit", transform: "translateX(-6px)" }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EggAlt sx={{ color: "primary.main", fontSize: 20 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight="bold">
              La Yema de Oro
            </Typography>
          </Box>

          {cajaAbierta && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                bgcolor: "rgba(245, 158, 11, 0.2)",
                color: "#2C1810",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              <WarningIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={500}>
                Caja abierta
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bloque derecho */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="large"
            onClick={handleNotifMenu}
            color="inherit"
            sx={{ color: "#2C1810" }}
          >
            <Badge badgeContent={lowStock.length} color="error">
              <NotificationsIcon sx={{ color: "#2C1810" }} />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ sx: { mt: 1, minWidth: 300, maxHeight: 400 } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Stock Bajo
              </Typography>
            </Box>
            <Divider />
            <List sx={{ py: 0 }}>
              {lowStock.map((p) => (
                <ListItem
                  key={p.id}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => {
                    handleNotifClose();
                    navigate("/stock");
                  }}
                >
                  <WarningIcon
                    sx={{ color: "error.main", mr: 1.5, fontSize: 20 }}
                  />
                  <ListItemText
                    primary={p.descripcion}
                    secondary={`Stock: ${p.stock} (Mínimo: ${p.stockMinimo})`}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              ))}
            </List>
          </Menu>

          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
            sx={{ color: "#2C1810" }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#2C1810",
                fontSize: "0.875rem",
              }}
            >
              {name ? name.charAt(0).toUpperCase() : "U"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
          >
            {name && (
              <>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {name}
                  </Typography>
                </Box>
                <Divider />
              </>
            )}
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/usuarios");
              }}
            >
              Usuarios
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
