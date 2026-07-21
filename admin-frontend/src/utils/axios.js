import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Add a request interceptor to attach the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('admin_jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
