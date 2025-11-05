import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isInRole } from "../utils/auth";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const authToken = localStorage.getItem("authToken");
  const location = useLocation();

  const stateAllowed = (location.state as any)?.allowedRoles as
    | string[]
    | undefined;
  const rolesToCheck = stateAllowed ?? allowedRoles;

  if (!authToken) return <Navigate to="/login" replace />;

  if (rolesToCheck && rolesToCheck.length > 0 && !isInRole(rolesToCheck)) {
    return <Navigate to="/error/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
