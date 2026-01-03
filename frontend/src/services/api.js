import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Trip API calls
export const tripAPI = {
  getAll: (status) => api.get('/trips', { params: { status } }),
  getById: (id) => api.get(`/trips/${id}`),
  create: (tripData) => api.post('/trips', tripData),
  update: (id, tripData) => api.put(`/trips/${id}`, tripData),
  delete: (id) => api.delete(`/trips/${id}`),
  addStop: (stopData) => api.post('/trips/stops', stopData),
  addActivity: (activityData) => api.post('/trips/activities', activityData),
  getBudget: (id) => api.get(`/trips/${id}/budget`)
};

// City API calls
export const cityAPI = {
  getAll: (params) => api.get('/cities', { params }),
  getById: (id) => api.get(`/cities/${id}`),
  getPopular: (limit) => api.get('/cities/popular', { params: { limit } }),
  getCountries: () => api.get('/cities/countries')
};

// Activity API calls
export const activityAPI = {
  getAll: (params) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  getByCity: (cityId, category) => api.get(`/activities/city/${cityId}`, { params: { category } }),
  getCategories: () => api.get('/activities/categories')
};

export default api;
