import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) window.location.assign("/error/401");
    else if (status === 403) window.location.assign("/error/403");
    else if (status >= 500) window.location.assign("/error/500");
    return Promise.reject(err);
  }
);

export default api;
