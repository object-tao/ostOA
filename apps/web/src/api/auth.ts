export type SessionUser = {
  id: string;
  email?: string;
  username?: string;
  realName: string;
  roleCode: string;
  roleName: string;
};

const TOKEN_KEY = 'obiecrm-token';
const USER_KEY = 'obiecrm-user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSessionUser(): SessionUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
