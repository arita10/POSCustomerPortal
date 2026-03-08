import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://posbackend-latest.onrender.com';

export const http = axios.create({ baseURL: BASE_URL });

http.interceptors.request.use((config) => {
  const raw = localStorage.getItem('portal-auth');
  if (raw) {
    try {
      const { accessToken } = JSON.parse(raw);
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    } catch {
      // ignore
    }
  }
  return config;
});

export const apiGet = <T>(url: string): Promise<T> =>
  http.get<T>(url).then((r) => r.data);

export const apiPost = <T>(url: string, data?: unknown): Promise<T> =>
  http.post<T>(url, data).then((r) => r.data);
