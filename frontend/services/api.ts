import axios from 'axios';

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to use mock API for development
const USE_MOCK_API = true;

// Mock API implementation
const mockApi = {
  login: async (credentials: { email: string; password: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check credentials (in a real app, this would be done on the server)
    if (credentials.email && credentials.password) {
      // Generate a mock token and user
      const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      const user = {
        id: '123',
        email: credentials.email,
        firstName: 'Demo',
        lastName: 'User',
        createdAt: new Date().toISOString(),
        role: 'user'
      };
      
      return {
        data: {
          access_token: token,
          user
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },
  
  register: async (userData: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, there would be validation and the user would be stored in a database
    if (userData.email && userData.password) {
      const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      const user = {
        id: '123',
        email: userData.email,
        firstName: userData.firstName || 'New',
        lastName: userData.lastName || 'User',
        createdAt: new Date().toISOString(),
        role: 'user'
      };
      
      return {
        data: {
          access_token: token,
          user
        }
      };
    } else {
      throw new Error('Invalid user data');
    }
  },
  
  getCurrentUser: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real app, the token would be verified and the user retrieved from the database
    const token = localStorage.getItem('token');
    
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        data: user
      };
    } else {
      throw { response: { status: 401, data: { message: 'Unauthorized' } } };
    }
  },
  
  updateProfile: async (userData: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real app, the user would be updated in the database
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...userData };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return {
      data: updatedUser
    };
  }
};

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
    
    return USE_MOCK_API 
      ? mockApi.register(requestData)
      : api.post('/api/auth/register', requestData);
  },
  
  login: (credentials: { email: string; password: string }) => {
    return USE_MOCK_API
      ? mockApi.login(credentials)
      : api.post('/api/auth/login', credentials);
  },
  
  googleAuth: () => {
    if (USE_MOCK_API) {
      alert('Google Auth is not available in mock mode');
      return;
    }
    window.location.href = `${api.defaults.baseURL}/api/auth/google`;
  }
};

// Telegram related API calls
export const telegramApi = {
  getConnectionStatus: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          isConnected: false
        }
      });
    }
    return api.get('/api/telegram/status');
  },
  
  connect: (phoneNumber: string) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          success: true,
          message: 'Verification code sent (mock)'
        }
      });
    }
    return api.post('/api/telegram/connect', { phoneNumber });
  },
  
  verifyCode: (code: string) => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: {
          isConnected: true,
          phoneNumber: '+1234567890'
        }
      });
    }
    return api.post('/api/telegram/verify-code', { code });
  },
  
  getContacts: () => {
    if (USE_MOCK_API) {
      return Promise.resolve({
        data: [
          { id: '1', name: 'John Doe', lastMessage: 'Hello', unread: 2 },
          { id: '2', name: 'Jane Smith', lastMessage: 'How are you?', unread: 0 },
          { id: '3', name: 'Bob Johnson', lastMessage: 'See you later', unread: 1 }
        ]
      });
    }
    return api.get('/api/telegram/contacts');
  }
};

// User related API calls
export const userApi = {
  getCurrentUser: () => {
    // From the Railway logs, we can see there's no specific user endpoint
    // We could potentially use /api/auth/me if it's implemented, but for now let's keep using mock
    return USE_MOCK_API
      ? mockApi.getCurrentUser()
      : api.get('/api/auth/profile'); // This is a guess at what the endpoint might be
  },
  
  updateProfile: (userData: { firstName?: string; lastName?: string; email?: string }) => {
    return USE_MOCK_API
      ? mockApi.updateProfile(userData)
      : api.put('/api/auth/profile', userData); // This is a guess at what the endpoint might be
  }
};

export default api; 