import { useState } from "react";
import { NavLink } from "react-router-dom";
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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart,
  Warehouse,
  AttachMoney,
  Menu as MenuIcon,
} from "@mui/icons-material";

const menuItems = [
  { title: "Dashboard", icon: DashboardIcon, path: "/" },
  { title: "Productos", icon: InventoryIcon, path: "/productos" },
  { title: "Ventas", icon: ShoppingCart, path: "/ventas" },
  { title: "Stock", icon: Warehouse, path: "/stock" },
  { title: "Precios Públicos", icon: AttachMoney, path: "/precios" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const drawerWidth = collapsed ? 70 : 240;

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
              <InventoryIcon sx={{ color: "white", fontSize: 20 }} />
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

      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
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
      </List>
    </Drawer>
  );
}
