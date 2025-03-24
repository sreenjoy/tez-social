import axios from 'axios';

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: 'https://tez-social-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request and response logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If token exists, add it to the authorization header
    if (token) {
      config.headers = config.headers || {};
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
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    
    // Check if the response has an error status in the data
    // Some APIs return 200 but include error information in the body
    if (response.data && (response.data.statusCode >= 400 || response.data.error)) {
      const error: any = new Error(response.data.message || 'API Error');
      error.response = {
        status: response.data.statusCode || 500,
        data: response.data
      };
      return Promise.reject(error);
    }
    
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    
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
    const requestData = { 
      firstName: name,
      ...rest
    };
    
    return api.post('/api/auth/register', requestData);
  },
  
  login: (credentials: { email: string; password: string }) => {
    return api.post('/api/auth/login', credentials);
  },
  
  googleAuth: () => {
    window.location.href = `${api.defaults.baseURL}/api/auth/google`;
  }
};

// Telegram related API calls
export const telegramApi = {
  getConnectionStatus: () => {
    return api.get('/api/telegram/status');
  },
  
  connect: (phoneNumber: string) => {
    return api.post('/api/telegram/connect', { phoneNumber });
  },
  
  verifyCode: (code: string) => {
    return api.post('/api/telegram/verify-code', { code });
  },
  
  getContacts: () => {
    return api.get('/api/telegram/contacts');
  }
};

// User related API calls
export const userApi = {
  getCurrentUser: () => {
    return api.get('/api/protected');
  },
  
  updateProfile: (userData: { firstName?: string; lastName?: string; email?: string }) => {
    return api.put('/api/users/update', userData);
  }
};

export default api; 