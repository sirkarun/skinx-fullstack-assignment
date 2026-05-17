import axios, { AxiosError } from 'axios';
import { tokenStorage } from './storage';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      tokenStorage.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string } } | undefined;
    return data?.error?.message ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}
