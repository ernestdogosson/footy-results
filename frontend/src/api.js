// in dev, VITE_API_URL is empty so the Vite proxy handles same-origin requests.
// in prod, set VITE_API_URL to the backend URL so the browser hits it directly
// with credentials (the auth cookie travels cross-site).
const base = import.meta.env.VITE_API_URL ?? '';

export function api(path, options = {}) {
  return fetch(`${base}${path}`, { ...options, credentials: 'include' });
}

export function apiUrl(path) {
  return `${base}${path}`;
}
