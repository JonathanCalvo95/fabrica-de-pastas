import ErrorPage from "./ErrorPage";
import { ReportProblem } from "@mui/icons-material";

export default function ServerError() {
  return (
    <ErrorPage
      code="500"
      title="Error del servidor"
      message="Ocurrió un problema inesperado. Intenta nuevamente en unos minutos."
      Icon={ReportProblem}
      actionLabel="Reintentar"
      onActionClick={() => window.location.reload()}
    />
  );
}
