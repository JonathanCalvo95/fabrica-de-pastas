export function parseJwt(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

import { tipoRolLabel } from "../utils/enums";

export function getUserRole(): string | null {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;

  let r: string | null = null;
  if (typeof payload.role === "string") r = payload.role;
  else if (Array.isArray(payload.role) && payload.role.length)
    r = String(payload.role[0]);
  else if (typeof payload.roles === "string") r = payload.roles;
  else if (Array.isArray(payload.roles) && payload.roles.length)
    r = String(payload.roles[0]);
  else if (
    typeof payload[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] === "string"
  )
    r = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  else if (typeof payload.rol === "string") r = payload.rol;

  if (!r) return null;

  // If role claim is numeric ("1","2","3") map to label using tipoRolLabel
  const num = Number(r);
  if (!Number.isNaN(num) && typeof num === "number") {
    return tipoRolLabel(num);
  }

  return r;
}

export function isInRole(allowed: string[] | undefined): boolean {
  if (!allowed || allowed.length === 0) return true;
  const r = getUserRole();
  if (!r) return false;
  const norm = (s: string) => s.toString().trim().toLowerCase();
  return allowed.map(norm).includes(norm(r));
}
