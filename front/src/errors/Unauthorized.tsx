import ErrorPage from "./ErrorPage";
import { LockOpen } from "@mui/icons-material";

export default function Unauthorized() {
  return (
    <ErrorPage
      code="401"
      title="Sesión expirada o no iniciada"
      message="Debes iniciar sesión para acceder a esta página."
      Icon={LockOpen}
      actionLabel="Ir al login"
      actionTo="/login"
    />
  );
}
