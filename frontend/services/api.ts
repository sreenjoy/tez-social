import axios from 'axios';

// Determine if we're in development mode (no real backend)
const IS_DEV_MODE = !process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL === 'http://localhost:3001';

// Mock users for development testing
const DEV_USERS = [
  { email: 'admin@example.com', password: 'password123', firstName: 'Admin' },
  { email: 'user@example.com', password: 'password123', firstName: 'User' }
];

// Create an axios instance with the base URL from environment variables
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
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

// Development mode helper for login
const devLogin = async (credentials: { email: string; password: string }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find user with matching email and password
  const user = DEV_USERS.find(u => 
    u.email === credentials.email && u.password === credentials.password
  );
  
  if (user) {
    // Generate a mock JWT token
    const token = 'dev_jwt_token_' + Math.random().toString(36).substring(2);
    
    return {
      data: {
        access_token: token,
        // Don't include password in the response
        user: { email: user.email, firstName: user.firstName }
      }
    };
  }
  
  // Throw authentication error if credentials don't match
  const error: any = new Error('Invalid credentials');
  error.response = {
    status: 401,
    data: { message: 'Invalid credentials', error: 'Unauthorized' }
  };
  throw error;
};

// Development mode helper for register
const devRegister = async (userData: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if user already exists
  if (DEV_USERS.some(u => u.email === userData.email)) {
    const error: any = new Error('User with this email already exists');
    error.response = {
      status: 400,
      data: { message: 'User with this email already exists', error: 'Bad Request' }
    };
    throw error;
  }
  
  // Generate a mock JWT token
  const token = 'dev_jwt_token_' + Math.random().toString(36).substring(2);
  
  // Add the new user to the development users array
  DEV_USERS.push({
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName
  });
  
  return {
    data: {
      access_token: token,
      user: { email: userData.email, firstName: userData.firstName }
    }
  };
};

// Auth related API calls
export const authApi = {
  register: (userData: { name: string; email: string; password: string }) => {
    // Convert name to firstName for backend compatibility
    const { name, ...rest } = userData;
    const requestData = { 
      firstName: name,
      ...rest
    };
    
    // Use development mode if no backend is available
    if (IS_DEV_MODE) {
      console.log('Using development mode for register');
      return devRegister(requestData);
    }
    
    return api.post('/api/auth/register', requestData);
  },
  
  login: (credentials: { email: string; password: string }) => {
    // Use development mode if no backend is available
    if (IS_DEV_MODE) {
      console.log('Using development mode for login');
      return devLogin(credentials);
    }
    
    return api.post('/api/auth/login', credentials);
  },
  
  googleAuth: () => {
    if (IS_DEV_MODE) {
      alert('Google Auth is not available in development mode');
      return;
    }
    window.location.href = `${api.defaults.baseURL}/api/auth/google`;
  }
};

// Telegram related API calls
export const telegramApi = {
  getConnectionStatus: () => {
    // Since /api/telegram/status doesn't exist according to logs,
    // return a default response until the backend implements this
    console.log('Telegram status requested, but endpoint not available');
    return Promise.resolve({
      data: {
        isConnected: false,
        message: 'Telegram connection feature not yet implemented in backend'
      }
    });
  },
  
  connect: (phoneNumber: string) => {
    console.log('Telegram connect requested with:', phoneNumber);
    return Promise.resolve({
      data: {
        success: false,
        message: 'Telegram connection feature not yet implemented in backend'
      }
    });
  },
  
  verifyCode: (code: string) => {
    console.log('Telegram verify code requested with:', code);
    return Promise.resolve({
      data: {
        success: false,
        message: 'Telegram verification feature not yet implemented in backend'
      }
    });
  },
  
  getContacts: () => {
    console.log('Telegram contacts requested');
    return Promise.resolve({
      data: []
    });
  }
};

// User related API calls
export const userApi = {
  getCurrentUser: () => {
    // In development mode, use stored user data
    if (IS_DEV_MODE) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return Promise.resolve({
          data: JSON.parse(storedUser)
        });
      }
      
      // If no stored user, return unauthorized error
      const error: any = new Error('Unauthorized');
      error.response = { status: 401, data: { message: 'Unauthorized' } };
      return Promise.reject(error);
    }
    
    // The /api/auth/me endpoint doesn't exist according to the logs
    // Let's use the protected endpoint that should return user data
    return api.get('/api/protected');
  },
  
  updateProfile: (userData: { firstName?: string; lastName?: string; email?: string }) => {
    // Since we don't know if there's a profile update endpoint, let's just log the request for now
    console.log('Update profile request:', userData);
    // Return a dummy successful response until we have a real endpoint
    return Promise.resolve({
      data: {
        success: true,
        data: userData
      }
    });
  }
};

export default api; 