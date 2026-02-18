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
  alpha,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import { getDashboard } from "../api/dashboard";
import { getCajaActual } from "../api/caja";
import { parseJwt } from "../utils/auth";
import { useSidebarCollapsed } from "../context/SidebarContext";
import { layout } from "../theme/Theme";

interface NavbarProps {
  onHeightChange?: (height: number) => void;
}

interface LowStockItem {
  id: string;
  descripcion: string;
  stock: string;
  stockMinimo: string;
}

function LogoMark() {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/logo.png"
        alt="La Yema de Oro"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </Box>
  );
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
    const storedUser = localStorage.getItem("usuario");
    if (storedUser && storedUser.trim().length > 0) {
      setName(storedUser.trim());
      return;
    }
    const token = localStorage.getItem("authToken");
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        const possible = [
          payload.name,
          payload.Name,
          payload.usuario,
          payload.user,
          payload.username,
        ].filter(
          (v) => typeof v === "string" && v.trim().length > 0
        ) as string[];
        if (possible.length) setName(possible[0]);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getDashboard();
        if (mounted && data.lowStock) {
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
      } catch {
        if (mounted) setLowStock([]);
      }
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
        background: (t) =>
          `linear-gradient(135deg, ${alpha(
            t.palette.primary.main,
            0.9
          )}, ${alpha(t.palette.primary.dark, 0.9)})`,
        color: (t) => t.palette.primary.contrastText,
        borderBottom: layout.BORDER,
        borderColor: "divider",
        zIndex: (t) => t.zIndex.drawer + 2,
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        left: 0,
        width: "100%",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: layout.TOPBAR_HEIGHT,
          pl: `${drawerWidth + 8}px`,
          pr: 3,
          transition: "padding-left 0.28s ease",
        }}
      >
        {/* Izquierda */}
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
            to="/dashboard"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <LogoMark />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ letterSpacing: -0.2 }}
            >
              La Yema de Oro
            </Typography>
          </Box>

          {cajaAbierta && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "rgba(255,255,255,0.95)",
                color: "warning.dark",
                px: 2,
                py: 0.75,
                border: "2px solid",
                borderColor: "warning.main",
                borderRadius: 1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <WarningIcon sx={{ fontSize: 20, color: "warning.main" }} />
              <Typography variant="body2" fontWeight={700} sx={{ letterSpacing: 0.3 }}>
                CAJA ABIERTA
              </Typography>
            </Box>
          )}
        </Box>

        {/* Derecha */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            size="large"
            onClick={handleNotifMenu}
            sx={{
              color: "white",
            }}
          >
            <Badge
              badgeContent={lowStock.length}
              color="error"
              overlap="circular"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Stock bajo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Productos por debajo del stock mínimo.
              </Typography>
            </Box>
            <Divider />
            <List sx={{ py: 0 }}>
              {lowStock.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Sin alertas de stock."
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
              )}
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

          {name && (
            <Typography
              variant="body2"
              sx={{
                color: "white",
                fontWeight: 600,
                maxWidth: 160,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={name}
            >
              {name}
            </Typography>
          )}

          <IconButton
            onClick={handleMenu}
            sx={{
              color: "white",
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "white",
                color: "primary.contrastText",
                fontSize: "0.875rem",
              }}
            >
              <AccountCircleIcon
                sx={{
                  color: "primary.dark",
                }}
              />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
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
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
