export const MEDIDA_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Kilogramo" },
  { value: 2, label: "Unidad" },
  { value: 3, label: "Litro" },
  { value: 4, label: "Caja" },
];

export const medidaLabel = (v?: number): string =>
  MEDIDA_OPTIONS.find((m) => m.value === v)?.label ?? String(v ?? "");

export const CATEGORY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Ravioles" },
  { value: 2, label: "Canelones" },
  { value: 3, label: "Agnolottis" },
  { value: 4, label: "Tallarines" },
  { value: 5, label: "Ñoquis" },
  { value: 6, label: "Sorrentinos" },
  { value: 7, label: "Capelettis" },
  { value: 8, label: "Tortellettis" },
  { value: 9, label: "Salsas" },
  { value: 10, label: "Tartas" },
  { value: 11, label: "Varios" },
  { value: 12, label: "Postres" },
  { value: 13, label: "Pizzas" },
  { value: 14, label: "Empanadas" },
];

export const categoriaLabel = (v?: number): string =>
  CATEGORY_OPTIONS.find((c) => c.value === v)?.label ?? String(v ?? "");

export const ESTADO_CAJA_OPTIONS: {
  value: number;
  label: string;
  color: "success" | "default" | "warning";
}[] = [
  { value: 1, label: "Abierta", color: "success" },
  { value: 2, label: "Cerrada", color: "default" },
  { value: 3, label: "Pausada", color: "warning" },
];

export const estadoCajaInfo = (v?: number) =>
  ESTADO_CAJA_OPTIONS.find((o) => o.value === v) ?? ESTADO_CAJA_OPTIONS[1];

// === Pago / Estado de venta ===
export const METODO_PAGO_OPTIONS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: "Efectivo" },
  { value: 2, label: "Mercado Pago" },
  { value: 3, label: "Transferencia" },
];

export const metodoPagoLabel = (v?: number): string =>
  METODO_PAGO_OPTIONS.find((m) => m.value === v)?.label ?? String(v ?? "");

export const ESTADO_VENTA_OPTIONS: {
  value: 1 | 2 | 3;
  label: string;
  color: "success" | "error" | "warning";
}[] = [
  { value: 1, label: "Completada", color: "success" },
  { value: 2, label: "Anulada", color: "error" },
  { value: 3, label: "Devuelta", color: "warning" },
];

export const estadoVentaInfo = (v?: number) =>
  ESTADO_VENTA_OPTIONS.find((o) => o.value === v) ?? ESTADO_VENTA_OPTIONS[0];

export const TIPO_ROL_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Administrador" },
  { value: 2, label: "Productor" },
  { value: 3, label: "Vendedor" },
];

export const tipoRolLabel = (v?: number): string =>
  TIPO_ROL_OPTIONS.find((r) => r.value === v)?.label ?? String(v ?? "");

export const tipoRolColor = (v?: number): "error" | "warning" | "primary" => {
  switch (v) {
    case 1:
      return "primary";
    case 2:
      return "primary";
    default:
      return "primary";
  }
};

// === Estados de Pedido ===
export const ESTADO_PEDIDO_OPTIONS: {
  value: 1 | 2 | 3 | 4;
  label: string;
  color: "info" | "success" | "warning" | "error";
}[] = [
  { value: 1, label: "Pendiente", color: "info" },
  { value: 2, label: "Confirmado", color: "warning" },
  { value: 3, label: "Entregado", color: "success" },
  { value: 4, label: "Cancelado", color: "error" },
];

export const estadoPedidoInfo = (v?: number) =>
  ESTADO_PEDIDO_OPTIONS.find((o) => o.value === v) ?? ESTADO_PEDIDO_OPTIONS[0];
