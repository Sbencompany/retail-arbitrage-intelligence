import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const resp = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = resp.data.data;
          localStorage.setItem('accessToken', accessToken);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

export const opportunitiesApi = {
  list: (params?: any) => api.get('/opportunities', { params }),
  get: (id: string) => api.get(`/opportunities/${id}`),
  stats: () => api.get('/opportunities/stats'),
  analyze: (data: any) => api.post('/opportunities/analyze', data),
  dismiss: (id: string) => api.patch(`/opportunities/${id}/dismiss`),
  purchase: (id: string) => api.patch(`/opportunities/${id}/purchase`),
};

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  topOpportunities: (limit?: number) => api.get('/analytics/top-opportunities', { params: { limit } }),
};

export const productsApi = {
  list: (params?: any) => api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  byUpc: (upc: string) => api.get(`/products/upc/${upc}`),
  byAsin: (asin: string) => api.get(`/products/asin/${asin}`),
  categories: () => api.get('/products/categories'),
};

export const alertsApi = {
  list: (params?: any) => api.get('/alerts', { params }),
  unreadCount: () => api.get('/alerts/unread-count'),
  markRead: (id: string) => api.patch(`/alerts/${id}/read`),
  markAllRead: () => api.patch('/alerts/read-all'),
};

export const profitabilityApi = {
  calculate: (data: any) => api.post('/profitability/calculate', data),
  compareMarketplaces: (data: any) => api.post('/profitability/compare-marketplaces', data),
};

export const freightApi = {
  quotes: (data: any) => api.post('/freight/quotes', data),
  cheapest: (data: any) => api.post('/freight/cheapest', data),
};

export const marketplaceApi = {
  status: () => api.get('/marketplace/status'),
  searchByUpc: (upc: string) => api.get(`/marketplace/upc/${upc}`),
  search: (q: string) => api.get('/marketplace/search', { params: { q } }),
};

export const searchApi = {
  search: (q: string, type?: string) => api.get('/search', { params: { q, type } }),
};

export const dealDiscoveryApi = {
  triggerScan: () => api.post('/deals/scan'),
  scanStore: (slug: string) => api.post(`/deals/scan/${slug}`),
  status: () => api.get('/deals/status'),
};

export const usersApi = {
  me: () => api.get('/users/me'),
  stats: () => api.get('/users/me/stats'),
  settings: () => api.get('/users/me/settings'),
  updateSettings: (data: any) => api.put('/users/me/settings', data),
  updateProfile: (data: any) => api.patch('/users/me/profile', data),
};
