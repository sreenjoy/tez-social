import axios from 'axios';

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If token exists, add it to the authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // If we receive a 401 Unauthorized, clear local storage and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth related API calls
export const authApi = {
  register: (userData: { name: string; email: string; password: string }) => {
    // Convert name to firstName for backend compatibility
    const { name, ...rest } = userData;
    return api.post('/auth/register', { 
      firstName: name,
      ...rest
    });
  },
  
  login: (credentials: { email: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },
  
  googleAuth: () => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  }
};

// Telegram related API calls
export const telegramApi = {
  getConnectionStatus: () => {
    return api.get('/telegram/status');
  },
  
  connect: (phoneNumber: string) => {
    return api.post('/telegram/connect', { phoneNumber });
  },
  
  verifyCode: (code: string) => {
    return api.post('/telegram/verify-code', { code });
  },
  
  getContacts: () => {
    return api.get('/telegram/contacts');
  }
};

// User related API calls
export const userApi = {
  getCurrentUser: () => {
    return api.get('/users/me');
  },
  
  updateProfile: (userData: { name?: string; email?: string }) => {
    return api.put('/users/me', userData);
  }
};

export default api; 