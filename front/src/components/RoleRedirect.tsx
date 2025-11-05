import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

export default function RoleRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getUserRole();
    if (!role) {
      navigate("/login", { replace: true });
      return;
    }

    if (role === "Administrador") navigate("/dashboard", { replace: true });
    else if (role === "Productor") navigate("/stock", { replace: true });
    else if (role === "Vendedor") navigate("/ventas", { replace: true });
    else navigate("/precios/1", { replace: true });
  }, [navigate]);

  return null;
}
