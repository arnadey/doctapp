import { apiUrl } from '@/config/api';
import { clearTokens, loadTokens, saveTokens } from '@/storage/tokens';
import { ApiError, ApiErrorPayload, AuthTokens } from '@/types/auth';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  isRefreshRequest?: boolean;
  skipAuth?: boolean;
};

let refreshPromise: Promise<AuthTokens | null> | null = null;
let onRefreshFailure: (() => void) | null = null;

export function setRefreshFailureHandler(handler: (() => void) | null): void {
  onRefreshFailure = handler;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function refreshTokens(): Promise<AuthTokens | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const current = await loadTokens();
      if (!current) return null;
      const response = await fetch(apiUrl('/accounts/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: current.refresh }),
      });
      if (!response.ok) return null;
      const payload = (await parseResponse(response)) as Partial<AuthTokens>;
      if (!payload.access || !payload.refresh) return null;
      const next = { access: payload.access, refresh: payload.refresh };
      await saveTokens(next);
      return next;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const { isRefreshRequest, skipAuth, body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  if (!(body instanceof FormData)) requestHeaders.set('Content-Type', 'application/json');
  if (!skipAuth) {
    const tokens = await loadTokens();
    if (tokens) requestHeaders.set('Authorization', `Bearer ${tokens.access}`);
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    method: init.method ?? 'GET',
    headers: requestHeaders,
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && retry && !isRefreshRequest && !skipAuth) {
    const tokens = await refreshTokens();
    if (tokens) return request<T>(path, options, false);
    await clearTokens();
    onRefreshFailure?.();
  }

  if (!response.ok) {
    throw new ApiError(response.status, (await parseResponse(response)) as ApiErrorPayload);
  }
  return (await parseResponse(response)) as T;
}

export const api = {
  health: () => request<{ status?: string }>('/health/', { skipAuth: true }),
  register: (body: Record<string, unknown>) => request<AuthTokens>('/accounts/register/', { method: 'POST', body, skipAuth: true }),
  login: (body: { email: string; password: string }) => request<AuthTokens>('/accounts/login/', { method: 'POST', body, skipAuth: true }),
  refresh: () => refreshTokens(),
  logout: async () => {
    const current = await loadTokens();
    try {
      await request('/accounts/logout/', {
        method: 'POST',
        body: current ? { refresh: current.refresh } : {},
      });
    } finally {
      await clearTokens();
    }
  },
  me: () => request<import('@/types/auth').AuthenticatedUser>('/accounts/me/'),
  updateMe: (body: Record<string, unknown> | FormData) =>
    request<import('@/types/auth').AuthenticatedUser>('/accounts/me/', { method: 'PATCH', body }),
  changePassword: (body: { old_password: string; new_password: string }) =>
    request('/accounts/change-password/', { method: 'POST', body }),
  passwordReset: (body: { email: string }) =>
    request('/accounts/password-reset/', { method: 'POST', body, skipAuth: true }),
  passwordResetConfirm: (body: { uid: string; token: string; new_password: string }) =>
    request('/accounts/password-reset/confirm/', { method: 'POST', body, skipAuth: true }),
};

export { saveTokens };
