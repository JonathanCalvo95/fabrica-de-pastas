import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
}

/**
 * Función para autenticar un usuario.
 * @param data Los datos de inicio de sesión del usuario.
 * @returns Una Promesa que resuelve en la respuesta de la API (con el token JWT).
 */
export const login = async (data: ILoginRequest): Promise<ILoginResponse> => {
    const response = await axios.post<ILoginResponse>(`${API_URL}/Auth/login`, data);
    return response.data;
};
