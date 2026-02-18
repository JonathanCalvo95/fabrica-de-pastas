import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from "@mui/material";
import { Dvr, ExpandLess, ExpandMore } from "@mui/icons-material";

import { useSidebarCollapsed } from "../context/SidebarContext";
import { getUserRole } from "../utils/auth";
import { MENU_ITEMS } from "../config/navigation";
import { layout } from "../theme/Theme";

type MenuItem = {
  title: string;
  icon: React.ElementType;
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
  const { collapsed, toggle } = useSidebarCollapsed();
  const [preciosOpen, setPreciosOpen] = useState(false);
  const location = useLocation();
  const role = getUserRole();

  const drawerWidth = collapsed
    ? layout.DRAWER_WIDTH_COLLAPSED
    : layout.DRAWER_WIDTH;

  useEffect(() => {
    if (/^\/precios\/[1-3]$/.test(location.pathname)) {
      if (collapsed) toggle();
      setPreciosOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handlePreciosClick = () => {
    if (collapsed) {
      toggle();
      setPreciosOpen(true);
      return;
    }
    setPreciosOpen((v) => !v);
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
          pt: `${layout.TOPBAR_HEIGHT}px`,
          borderRight: layout.BORDER,
          borderColor: "divider",
          bgcolor: "background.paper",
          transition: "width 0.28s ease",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <List sx={{ p: 0, flexGrow: 1 }}>
          {menuItems
            .filter(
              (item) =>
                !item.allowedRoles || item.allowedRoles.includes(role ?? "")
            )
            .map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    px: collapsed ? 1.2 : 1.8,
                    gap: collapsed ? 0 : 1.4,
                    "& .MuiListItemIcon-root": {
                      minWidth: collapsed ? 0 : 28,
                      color: "text.secondary",
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: "1.2rem",
                    },
                    "& .MuiListItemText-primary": {
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "text.secondary",
                    },
                    "&.active": {
                      bgcolor: "primary.main",
                      "& .MuiListItemText-primary": {
                        color: "text.primary",
                        fontWeight: 600,
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.title} />}
                </ListItemButton>
              </ListItem>
            ))}

          {/* Botón Precios */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={handlePreciosClick}
              aria-expanded={preciosOpen}
              sx={{
                px: collapsed ? 1.2 : 1.8,
                py: 0.8,
                gap: collapsed ? 0 : 1.4,
                "& .MuiListItemIcon-root": {
                  minWidth: collapsed ? 0 : 28,
                  color: "text.secondary",
                },
                "& .MuiSvgIcon-root": {
                  fontSize: "1.2rem",
                },
                "& .MuiListItemText-primary": {
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "text.secondary",
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.65)",
                },
              }}
            >
              <ListItemIcon>
                <Dvr />
              </ListItemIcon>

              {!collapsed && (
                <>
                  <ListItemText primary="Precios" />
                  {preciosOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </ListItem>

          <Collapse in={preciosOpen && !collapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {preciosItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    sx={{
                      ml: 3.5,
                      px: 1.8,
                      py: 0.65,
                      "& .MuiListItemText-primary": {
                        fontSize: "0.85rem",
                        color: "text.secondary",
                      },
                      "&.active": {
                        bgcolor: "rgba(212,165,116,0.18)",
                        "& .MuiListItemText-primary": {
                          color: "text.primary",
                          fontWeight: 600,
                        },
                      },
                      "&:hover": { bgcolor: "rgba(255,255,255,0.75)" },
                    }}
                  >
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
}
