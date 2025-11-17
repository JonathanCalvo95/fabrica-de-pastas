import Dashboard from "../pages/Dashboard";
import Productos from "../pages/Productos";
import Ventas from "../pages/Ventas";
import CrearVenta from "../pages/CrearVenta";
import DetalleVenta from "../pages/DetalleVenta";
import Pedidos from "../pages/Pedidos";
import CrearPedido from "../pages/CrearPedido";
import DetallePedido from "../pages/DetallePedido";
import Stock from "../pages/Stock";
import Caja from "../pages/Caja";
import Usuarios from "../pages/Usuarios";

import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart,
  Warehouse,
  AccountBalance,
  People,
  ListAlt,
} from "@mui/icons-material";

export type NavItem = {
  title?: string;
  path: string;
  icon?: any;
  element?: any;
  allowedRoles?: string[];
  index?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: DashboardIcon, element: Dashboard, allowedRoles: ["Administrador"] },
  { title: "Ventas", path: "/ventas", icon: ShoppingCart, element: Ventas, allowedRoles: ["Administrador", "Vendedor"] },
  { title: "Pedidos", path: "/pedidos", icon: ListAlt, element: Pedidos, allowedRoles: ["Administrador", "Vendedor"] },
  { title: "Caja", path: "/caja", icon: AccountBalance, element: Caja, allowedRoles: ["Administrador", "Vendedor"] },
  { title: "Crear Venta", path: "/ventas/crear", element: CrearVenta, allowedRoles: ["Administrador", "Vendedor"] },
  { title: "Detalle Venta", path: "/ventas/:id", element: DetalleVenta, allowedRoles: ["Administrador", "Vendedor"] },
  { title: "Crear Pedido", path: "/pedidos/crear", element: CrearPedido, allowedRoles: ["Administrador", "Vendedor"] },
  { title: "Detalle Pedido", path: "/pedidos/:id", element: DetallePedido, allowedRoles: ["Administrador", "Vendedor"] },
  { title: "Stock", path: "/stock", icon: Warehouse, element: Stock, allowedRoles: ["Administrador", "Productor"] },
  { title: "Productos", path: "/productos", icon: InventoryIcon, element: Productos, allowedRoles: ["Administrador", "Productor"] },
  { title: "Usuarios", path: "/usuarios", icon: People, element: Usuarios, allowedRoles: ["Administrador"] },
];

export const MENU_ITEMS = NAV_ITEMS.filter((n) => n.title && n.icon).map((n) => ({
  title: n.title!,
  path: n.path,
  icon: n.icon,
  allowedRoles: n.allowedRoles,
}));
