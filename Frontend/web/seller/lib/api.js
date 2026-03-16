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

export const sellerApi = {
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
};

export default api;
