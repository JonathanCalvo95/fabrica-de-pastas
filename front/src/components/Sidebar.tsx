import { useState, useEffect } from "react";
import { useSidebarCollapsed } from "../context/SidebarContext";
import { getUserRole } from "../utils/auth";
import { MENU_ITEMS } from "../config/navigation";
import { NavLink, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { AttachMoney, ExpandLess, ExpandMore } from "@mui/icons-material";
import { layout } from "../theme/Theme";

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
  const { collapsed, toggle } = useSidebarCollapsed();
  const [preciosOpen, setPreciosOpen] = useState(false);
  const location = useLocation();

  const drawerWidth = collapsed
    ? layout.DRAWER_WIDTH_COLLAPSED
    : layout.DRAWER_WIDTH;

  useEffect(() => {
    if (/^\/precios\/[1-3]$/.test(location.pathname)) {
      if (collapsed) toggle();
      setPreciosOpen(true);
    }
  }, [location.pathname]);

  const role = getUserRole();

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
          transition: "width 0.3s",
          pt: `${layout.TOPBAR_HEIGHT}px`,
          borderRight: `${layout.BORDER}`,
          borderColor: "divider",
        },
      }}
    >
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
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
                  borderRadius: 2,
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                    fontWeight: 600,
                  },
                  "&:hover": { bgcolor: "action.hover" },
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

        {/* Botón de Precios */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={handlePreciosClick}
            aria-expanded={preciosOpen}
            sx={{ borderRadius: 2, "&:hover": { bgcolor: "action.hover" } }}
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

        <Collapse in={preciosOpen && !collapsed} timeout="auto" unmountOnExit>
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
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}
