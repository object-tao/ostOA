import { clearSession, getToken } from './auth';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://api.ostoa.org';
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLoopbackBrowser = hostname === '127.0.0.1' || hostname === 'localhost';
const isLanBrowser = hostname.startsWith('192.168.');
const localApiBaseUrl = import.meta.env.VITE_LOCAL_API_BASE_URL ?? 'http://127.0.0.1:8787';
const API_BASE_URL = isLoopbackBrowser ? localApiBaseUrl : isLanBrowser ? '' : configuredApiBaseUrl;

function normalizeErrorMessage(error: unknown, fallback = '请求失败'): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'string') return error || fallback;
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const direct = record.error ?? record.message ?? record.cause ?? record.detail;
    if (direct) return normalizeErrorMessage(direct, fallback);
    const errors = record.errors;
    if (Array.isArray(errors)) {
      const messages = errors.map((item) => normalizeErrorMessage(item, '')).filter(Boolean);
      if (messages.length) return messages.join('；');
    }
    try {
      const serialized = JSON.stringify(error);
      return serialized && serialized !== '{}' ? serialized : fallback;
    } catch {
      return String(error);
    }
  }
  return fallback;
}

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
    ...init,
    headers,
  });

  const contentType = response.headers.get('Content-Type') ?? '';
  const responseText = await response.text();

  if (!response.ok) {
    const trimmed = responseText.trimStart().toLowerCase();
    const isHtml = trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
    if (isHtml) {
      throw new Error('API 返回了网页内容，请检查后端 API 是否启动或接口地址是否正确。');
    }

    if (response.status === 401 && path !== '/api/auth/login') {
      clearSession();
      throw new Error('登录已失效，请重新登录。');
    }

    let message = '请求失败';
    if (contentType.includes('application/json') && responseText) {
      try {
        const payload = JSON.parse(responseText) as unknown;
        message = normalizeErrorMessage(payload, message);
      } catch {
        message = responseText || message;
      }
    } else {
      message = responseText || message;
    }
    throw new Error(message);
  }

  if (!contentType.includes('application/json')) {
    const trimmed = responseText.trimStart().toLowerCase();
    const isHtml = trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
    throw new Error(
      isHtml
        ? 'API 返回了网页内容，请检查后端 API 是否启动或本地端口是否被其他项目占用。'
        : responseText || 'API 返回格式不是 JSON',
    );
  }

  return JSON.parse(responseText) as T;
}
