// Physical device (Expo Go) → uses your machine's Wi-Fi LAN IP
// Android emulator only     → use 10.0.2.2 instead
const BASE_URL = 'http://10.135.186.195:3000/api';

const TIMEOUT_MS = 10000; // 10 seconds

const request = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const { headers: extraHeaders, ...restOptions } = options;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      signal: controller.signal,
      ...restOptions,
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
    });
    clearTimeout(timer);

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong.');
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Is the server running?');
    }
    if (err.message === 'Network request failed') {
      throw new Error('Cannot reach the server. Check your connection or server IP.');
    }
    throw err;
  }
};

export const authAPI = {
  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getMe: (token) =>
    request('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const productAPI = {
  newArrivals: (limit = 8) =>
    request(`/products/new-arrivals?limit=${limit}`),

  trending: (limit = 8) =>
    request(`/products/trending?limit=${limit}`),

  list: ({ category, search, limit = 20, offset = 0 } = {}) => {
    const params = new URLSearchParams({ limit, offset });
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    return request(`/products?${params}`);
  },

  get: (id) => request(`/products/${id}`),
};

export const wishlistAPI = {
  getAll: (token) =>
    request('/wishlist', { headers: authHeader(token) }),

  getIds: (token) =>
    request('/wishlist/ids', { headers: authHeader(token) }),

  add: (token, productId) =>
    request(`/wishlist/${productId}`, { method: 'POST', headers: authHeader(token) }),

  remove: (token, productId) =>
    request(`/wishlist/${productId}`, { method: 'DELETE', headers: authHeader(token) }),
};

export const addressAPI = {
  getAll: (token) =>
    request('/addresses', { headers: authHeader(token) }),

  create: (token, body) =>
    request('/addresses', {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify(body),
    }),

  update: (token, id, body) =>
    request(`/addresses/${id}`, {
      method: 'PUT',
      headers: authHeader(token),
      body: JSON.stringify(body),
    }),

  setDefault: (token, id) =>
    request(`/addresses/${id}/default`, {
      method: 'PATCH',
      headers: authHeader(token),
    }),

  delete: (token, id) =>
    request(`/addresses/${id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    }),
};
