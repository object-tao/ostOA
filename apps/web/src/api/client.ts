import { clearSession, getToken } from './auth';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8787';
const isLocalBrowser =
  typeof window !== 'undefined' &&
  (window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname.startsWith('192.168.'));
const API_BASE_URL = isLocalBrowser ? '' : configuredApiBaseUrl;

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...init,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    let message = '请求失败';
    const responseText = await response.text();
    try {
      const payload = JSON.parse(responseText) as { error?: string };
      message = payload.error ?? (responseText || message);
    } catch {
      message = responseText || message;
    }
    throw new Error(message);
  }

  return response.json();
}
