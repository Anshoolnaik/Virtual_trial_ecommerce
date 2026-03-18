import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('seller_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sellerAuth = {
  register: (data) => api.post('/api/seller/auth/register', data),
  login:    (data) => api.post('/api/seller/auth/login', data),
  me:       ()     => api.get('/api/seller/auth/me'),
};

export const sellerSettings = {
  updateProfile:       (data) => api.patch('/api/seller/auth/settings/profile', data),
  changePassword:      (data) => api.patch('/api/seller/auth/settings/password', data),
  updateNotifications: (data) => api.patch('/api/seller/auth/settings/notifications', data),
  updatePayout:        (data) => api.patch('/api/seller/auth/settings/payout', data),
  updatePolicies:      (data) => api.patch('/api/seller/auth/settings/policies', data),
};

export const sellerApi = {
  orders: {
    list:         ()             => api.get('/api/seller/orders'),
    updateStatus: (id, status)   => api.patch(`/api/seller/orders/${id}/status`, { status }),
  },
  products: {
    list:   ()         => api.get('/api/seller/products'),
    get:    (id)       => api.get(`/api/seller/products/${id}`),
    create: (formData) => api.post('/api/seller/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/api/seller/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete:     (id)              => api.delete(`/api/seller/products/${id}`),
    deleteImage:(id, imageId)     => api.delete(`/api/seller/products/${id}/images/${imageId}`),
    setPrimary: (id, imageId)     => api.patch(`/api/seller/products/${id}/images/${imageId}/primary`),
  },
  flashSales: {
    list:   ()          => api.get('/api/seller/flash-sales'),
    create: (data)      => api.post('/api/seller/flash-sales', data),
    update: (id, data)  => api.put(`/api/seller/flash-sales/${id}`, data),
    delete: (id)        => api.delete(`/api/seller/flash-sales/${id}`),
  },
};

export const publicApi = {
  flashSales: {
    active: (limit = 20) => api.get(`/api/flash-sales?limit=${limit}`),
  },
};

export default api;
