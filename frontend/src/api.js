const API_BASE = process.env.REACT_APP_API_URL || '';

export const TOKEN_KEY = 'nandani_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function register(body) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export function login(body) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) });
}

export function fetchMe() {
  return request('/api/auth/me');
}
