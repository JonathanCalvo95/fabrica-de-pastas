import { ErrorBoundary } from "react-error-boundary";
import GenericError from "./GenericError";

function Fallback({ error }: { error: Error; resetErrorBoundary: () => void }) {
  console.error("Error capturado por ErrorBoundary:", error);
  return (
    <GenericError message={error.message || "Ocurrió un error inesperado."} />
  );
}

export default function AppErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onReset={() => window.location.reload()}
      onError={(error, info) => {
        console.error("onError ErrorBoundary:", error, info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
