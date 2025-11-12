import ErrorPage from "./ErrorPage";
import { Block } from "@mui/icons-material";
import { getUserRole } from "../utils/auth";

export default function Forbidden() {
  const role = getUserRole();
  const home = role === "Administrador" ? "/dashboard" : role === "Productor" ? "/stock" : role === "Vendedor" ? "/ventas" : "/precios/1";
  return (
    <ErrorPage
      code="403"
      title="Acceso denegado"
      message="No tienes permisos para acceder a este recurso."
      Icon={Block}
      actionLabel="Volver al inicio"
      actionTo={home}
    />
  );
}
