import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Your NestJS backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for API calls
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

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized) here if needed
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Handle token refresh or redirect to login
    }

    return Promise.reject(error);
  }
);

export default api; 