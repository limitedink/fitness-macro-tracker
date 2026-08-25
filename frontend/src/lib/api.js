/**
 * Data access, in two interchangeable flavours.
 *
 * By default everything is kept in this browser's localStorage: no server, no
 * database, no accounts, and a static host such as GitHub Pages works fully.
 * Setting VITE_API_URL switches the whole app over to the REST backend in
 * `backend/`, which is what you want if you track from more than one device.
 */
import { localApi } from './localStore';
import { ApiError } from './ApiError';

export { ApiError };

const API_URL = import.meta.env.VITE_API_URL?.trim();

/** 'server' when VITE_API_URL is configured at build time, otherwise 'local'. */
export const DATA_MODE = API_URL ? 'server' : 'local';

const BASE_URL = (API_URL ?? '/api').replace(/\/$/, '');

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Is the API running?');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.error ?? `Request failed (${response.status})`, {
      status: response.status,
      fields: payload?.fields,
    });
  }

  return payload;
}

const query = (params) => {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null),
  ).toString();
  return search ? `?${search}` : '';
};

export const httpApi = {
  getSummary: (day, signal) => request(`/summary${query({ day })}`, { signal }),
  setTarget: (target) => request('/daily-targets', { method: 'PUT', body: target }),
  addMeal: (meal) => request('/meals', { method: 'POST', body: meal }),
  updateMeal: (id, updates) => request(`/meals/${id}`, { method: 'PATCH', body: updates }),
  deleteMeal: (id) => request(`/meals/${id}`, { method: 'DELETE' }),
  clearDay: (day) => request(`/meals${query({ day })}`, { method: 'DELETE' }),
};

export const api = DATA_MODE === 'server' ? httpApi : localApi;
