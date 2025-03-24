import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will be proxied via next.config.js
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include authentication
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const user = localStorage.getItem('user');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific HTTP errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear localStorage and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
      
      if (status === 403) {
        // Forbidden
        console.error('You do not have permission to access this resource');
      }
      
      if (status === 500) {
        // Server error
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Utility functions for common HTTP methods
export const http = {
  get: <T>(url: string, params = {}) => api.get<T>(url, { params }),
  post: <T>(url: string, data = {}) => api.post<T>(url, data),
  put: <T>(url: string, data = {}) => api.put<T>(url, data),
  delete: <T>(url: string) => api.delete<T>(url),
};

export default api; 