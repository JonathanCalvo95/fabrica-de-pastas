import ErrorPage from "./ErrorPage";
import { Block } from "@mui/icons-material";

export default function Forbidden() {
  return (
    <ErrorPage
      code="403"
      title="Acceso denegado"
      message="No tienes permisos para acceder a este recurso."
      Icon={Block}
      actionLabel="Volver al inicio"
      actionTo="/"
    />
  );
}
