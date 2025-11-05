import api from "./api";

export interface ILoginRequest {
  usuario: string;
  clave: string;
}
export interface ILoginResponse {
  token: string;
}

export const login = async (data: ILoginRequest): Promise<ILoginResponse> => {
  const response = await api.post<ILoginResponse>("/Auth/login", data, {
    headers: { "X-Skip-401-Redirect": "true" },
  });
  return response.data;
};
