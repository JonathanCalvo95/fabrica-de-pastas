import api from "./api";

export interface Usuario {
  id: string;
  nombre: string; // Username
  rol: number; // 1=Admin, 2=Productor, 3=Vendedor
  activo: boolean;
  fechaCreacion: string; // ISO
}

/* ===== GET ===== */
export const getUsuarios = async (): Promise<Usuario[]> => {
  const res = await api.get<Usuario[]>("/Auth");
  return res.data;
};

export const getUsuario = async (id: string): Promise<Usuario> => {
  const res = await api.get<Usuario>(`/Auth/${id}`);
  return res.data;
};

/* ===== POST (register) ===== */
export const crearUsuario = async (data: {
  usuario: string;
  clave: string;
  rol: number;
}) => {
  await api.post("/Auth/register", data);
};

/* ===== PUT (update) ===== */
export const actualizarUsuario = async (
  id: string,
  data: { nombre?: string; nuevaClave?: string; rol?: number; activo?: boolean }
) => {
  await api.put(`/Auth/${id}`, data);
};

/* ===== PATCH (toggle activo) ===== */
export const setUsuarioActivo = async (id: string, activo: boolean) => {
  await api.patch(`/Auth/${id}/activo`, activo, {
    headers: { "Content-Type": "application/json" },
  });
};
