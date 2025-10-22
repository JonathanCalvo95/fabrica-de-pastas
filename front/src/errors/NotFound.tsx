import ErrorPage from "./ErrorPage";
import { SearchOff } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();
  useEffect(
    () => console.error("404:", location.pathname),
    [location.pathname]
  );

  return (
    <ErrorPage
      code="404"
      title="Página no encontrada"
      message="Lo sentimos, la página que buscas no existe o ha sido movida."
      Icon={SearchOff}
      actionLabel="Volver al inicio"
      actionTo="/"
    />
  );
}
