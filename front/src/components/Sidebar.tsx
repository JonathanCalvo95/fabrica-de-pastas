import { useState, useEffect } from "react";
import { getUserRole } from "../utils/auth";
import { MENU_ITEMS } from "../config/navigation";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Divider,
  Avatar,
  Collapse,
} from "@mui/material";
import { AttachMoney, Menu as MenuIcon, Logout as LogoutIcon, ExpandLess, ExpandMore } from "@mui/icons-material";

type MenuItem = {
  title: string;
  icon: any;
  path: string;
  allowedRoles?: string[];
};

const menuItems = MENU_ITEMS as MenuItem[];

const preciosItems = [
  { title: "Precios 1", path: "/precios/1" },
  { title: "Precios 2", path: "/precios/2" },
  { title: "Precios 3", path: "/precios/3" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [preciosOpen, setPreciosOpen] = useState(false);
  const [usuario, setUsuario] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = collapsed ? 70 : 240;

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      setUsuario(usuario);
    }

    if (location.pathname.match(/^\/precios[1-6]$/)) {
      setPreciosOpen(true);
    }
  }, [location.pathname]);

  const role = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          transition: "width 0.3s",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #D4A574, #E8915F)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AttachMoney sx={{ color: "white", fontSize: 20 }} />
              </Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Fabrica de Pastas
            </Typography>
          </Box>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
          <MenuIcon />
        </IconButton>
      </Box>

      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {menuItems
          .filter((item) => {
            if (!item.allowedRoles) return true;
            return item.allowedRoles.includes(role ?? "");
          })
          .map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                    fontWeight: 600,
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? "unset" : 40,
                    color: "text.secondary",
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.title} />}
              </ListItemButton>
            </ListItem>
          ))}

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => setPreciosOpen(!preciosOpen)}
            sx={{
              borderRadius: 2,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? "unset" : 40,
                color: "text.secondary",
              }}
            >
              <AttachMoney />
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText primary="Precios" />
                {preciosOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {!collapsed && (
          <Collapse in={preciosOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {preciosItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    sx={{
                      borderRadius: 2,
                      pl: 4,
                      "&.active": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontWeight: 600,
                      },
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ px: 1, pb: 2 }}>
          <Box sx={{ p: 1.5, mb: 1, bgcolor: "action.hover", borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: "0.875rem",
                }}
              >
                {usuario.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="medium" noWrap>
                  {usuario}
                </Typography>
              </Box>
            </Box>
          </Box>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: "error.main",
              "&:hover": {
                bgcolor: "error.light",
                color: "error.contrastText",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? "unset" : 40,
                color: "inherit",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Cerrar Sesión" />}
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
}
