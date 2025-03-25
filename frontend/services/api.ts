import axios from 'axios';
import useAuthStore from '../store/authStore';
import { mockAuthApi } from './mockApi';

// Flag to control whether to use mock API
const USE_MOCK_API = true; // Set to false when backend is available

// Get the backend URL from environment variables or use local development URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Create a custom axios instance for our API
const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 10000,
});

// Add a request interceptor to include the auth token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from both localStorage and Zustand store
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || useAuthStore.getState().token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Extract data from response to match expected format for our frontend
    if (response.data && typeof response.data === 'object') {
      // NestJS wraps responses in a data field with metadata
      if (response.data.data !== undefined) {
        return { ...response, data: response.data.data };
      }
    }
    return response;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle 401 unauthorized
    if (error.response.status === 401) {
      // Clear auth state on unauthorized
      useAuthStore.getState().logout();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle other errors
    const errorMessage = error.response.data?.message || 'An error occurred. Please try again.';
    return Promise.reject(new Error(errorMessage));
  }
);

// Test if we should use mock API - detect if backend is not reachable
const testBackendAndSetMockMode = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (response.ok) {
      console.log('Backend is reachable, using real API');
      window.localStorage.setItem('useMockApi', 'false');
      return false;
    } else {
      console.log('Backend returned error, using mock API');
      window.localStorage.setItem('useMockApi', 'true');
      return true;
    }
  } catch (error) {
    console.log('Backend is not reachable, using mock API', error);
    window.localStorage.setItem('useMockApi', 'true');
    return true;
  }
};

// If in browser, check if we should use mock API
if (typeof window !== 'undefined') {
  const storedMockMode = window.localStorage.getItem('useMockApi');
  if (storedMockMode === null) {
    // Only run the test when the value is not set
    testBackendAndSetMockMode().catch(() => {
      window.localStorage.setItem('useMockApi', 'true');
    });
  }
}

// Function to check if mock API should be used
export const shouldUseMockApi = () => {
  // Use real backend now that it's fixed
  return false;
  
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('useMockApi') === 'true';
  }
  return USE_MOCK_API;
};

// API service for authentication related endpoints
export const authApi = {
  // Register a new user
  register: async (userData: any) => {
    // Use mock API if enabled
    if (shouldUseMockApi()) {
      try {
        return await mockAuthApi.register(userData);
      } catch (error: any) {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
    
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      // The response data has already been extracted by the interceptor
      if (!response.data) {
        throw new Error('Invalid response from server');
      }
      
      // After successful registration, try to login automatically
      return await authApi.login(userData.email, userData.password);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },
  
  // Login with email and password
  login: async (email: string, password: string) => {
    // Use mock API if enabled
    if (shouldUseMockApi()) {
      try {
        return await mockAuthApi.login(email, password);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to login. Please check your credentials.');
      }
    }
    
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      // The response interceptor should have already extracted the data field
      const data = response.data;
      
      if (!data.accessToken || !data.user) {
        throw new Error('Invalid response from server');
      }
      return data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to login. Please check your credentials.');
    }
  },
  
  // Logout the current user
  logout: async () => {
    // Use mock API if enabled
    if (shouldUseMockApi()) {
      return await mockAuthApi.logout();
    }
    
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
  
  // Get the current authenticated user
  getCurrentUser: async () => {
    // Use mock API if enabled
    if (shouldUseMockApi()) {
      return await mockAuthApi.getCurrentUser();
    }
    
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token: string) => {
    // Use mock API if enabled
    if (shouldUseMockApi()) {
      return await mockAuthApi.verifyEmail(token);
    }
    
    const response = await axiosInstance.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string) => {
    // Use mock API if enabled
    if (shouldUseMockApi()) {
      return await mockAuthApi.resendVerification(email);
    }
    
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Get user onboarding status
  getOnboardingStatus: async () => {
    // Use mock API if enabled
    if (shouldUseMockApi()) {
      return await mockAuthApi.getOnboardingStatus();
    }
    
    const response = await axiosInstance.get('/auth/onboarding-status');
    return response.data;
  },
};

// API service for user related endpoints
export const userApi = {
  // Get user profile
  getProfile: async (userId: string) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userId: string, profileData: any) => {
    const response = await axiosInstance.patch(`/users/${userId}`, profileData);
    return response.data;
  },
  
  // Get followers
  getFollowers: async (userId: string) => {
    const response = await axiosInstance.get(`/users/${userId}/followers`);
    return response.data;
  },
  
  // Get following
  getFollowing: async (userId: string) => {
    const response = await axiosInstance.get(`/users/${userId}/following`);
    return response.data;
  },
};

// API service for post related endpoints
export const postApi = {
  // Get feed posts
  getFeed: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // Create a new post
  createPost: async (postData: any) => {
    const response = await axiosInstance.post('/posts', postData);
    return response.data;
  },
  
  // Get a single post
  getPost: async (postId: string) => {
    const response = await axiosInstance.get(`/posts/${postId}`);
    return response.data;
  },
  
  // Delete a post
  deletePost: async (postId: string) => {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
  },
  
  // Like a post
  likePost: async (postId: string) => {
    const response = await axiosInstance.post(`/posts/${postId}/like`);
    return response.data;
  },
  
  // Unlike a post
  unlikePost: async (postId: string) => {
    const response = await axiosInstance.delete(`/posts/${postId}/like`);
    return response.data;
  },
  
  // Get post comments
  getComments: async (postId: string, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // Add a comment to a post
  addComment: async (postId: string, content: string) => {
    const response = await axiosInstance.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },
};

// API service for Telegram integration
export const telegramApi = {
  // Get connection status
  getConnectionStatus: async () => {
    const response = await axiosInstance.get('/telegram/status');
    return response.data;
  },
  
  // Connect Telegram account with phone number
  connect: async (phoneNumber: string) => {
    const response = await axiosInstance.post('/telegram/connect', { phoneNumber });
    return response.data;
  },
  
  // Verify code sent to Telegram
  verifyCode: async (code: string) => {
    const response = await axiosInstance.post('/telegram/verify', { code });
    return response.data;
  },
  
  // Get Telegram contacts
  getContacts: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get(`/telegram/contacts?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// API service for company related endpoints
export const companyApi = {
  // Create a new company
  createCompany: async (companyData: any) => {
    const response = await axiosInstance.post('/company', companyData);
    return response.data;
  },
  
  // Get current user's company
  getCurrentCompany: async () => {
    const response = await axiosInstance.get('/company');
    return response.data;
  },
  
  // Get company by ID
  getCompanyById: async (companyId: string) => {
    const response = await axiosInstance.get(`/company/${companyId}`);
    return response.data;
  },
};

// API service for pipeline related endpoints
export const pipelineApi = {
  // Get all pipelines for the current user's company
  getPipelines: async () => {
    const response = await axiosInstance.get('/pipeline');
    return response.data;
  },
  
  // Get the default pipeline for the company
  getDefaultPipeline: async () => {
    const response = await axiosInstance.get('/pipeline/default');
    return response.data;
  },
  
  // Get a specific pipeline by ID
  getPipelineById: async (pipelineId: string) => {
    const response = await axiosInstance.get(`/pipeline/${pipelineId}`);
    return response.data;
  },
  
  // Create a new pipeline
  createPipeline: async (pipelineData: any) => {
    const response = await axiosInstance.post('/pipeline', pipelineData);
    return response.data;
  },
  
  // Get all stages for a pipeline
  getPipelineStages: async (pipelineId: string) => {
    const response = await axiosInstance.get(`/pipeline/${pipelineId}/stages`);
    return response.data;
  },
  
  // Create a new stage in a pipeline
  createStage: async (pipelineId: string, stageData: any) => {
    const response = await axiosInstance.post(`/pipeline/${pipelineId}/stages`, stageData);
    return response.data;
  },
  
  // Reorder stages in a pipeline
  reorderStages: async (pipelineId: string, stageOrder: string[]) => {
    const response = await axiosInstance.put(`/pipeline/${pipelineId}/stages/reorder`, { order: stageOrder });
    return response.data;
  },
};

// API service for deal related endpoints
export const dealApi = {
  // Get deals by stage
  getDealsByStage: async (stageId: string) => {
    const response = await axiosInstance.get(`/deal/by-stage/${stageId}`);
    return response.data;
  },

  // Get deals by pipeline
  getDealsByPipeline: async (pipelineId: string) => {
    const response = await axiosInstance.get(`/deal/by-pipeline/${pipelineId}`);
    return response.data;
  },

  // Get deal by ID
  getDealById: async (id: string) => {
    const response = await axiosInstance.get(`/deal/${id}`);
    return response.data;
  },

  // Create new deal
  createDeal: async (dealData: any) => {
    const response = await axiosInstance.post('/deal', dealData);
    return response.data;
  },

  // Update deal
  updateDeal: async (id: string, updateData: any) => {
    const response = await axiosInstance.put(`/deal/${id}`, updateData);
    return response.data;
  },

  // Move deal to stage
  moveDealToStage: async (id: string, stageId: string) => {
    const response = await axiosInstance.put(`/deal/${id}/move`, { stageId });
    return response.data;
  },

  // Delete deal
  deleteDeal: async (id: string) => {
    const response = await axiosInstance.delete(`/deal/${id}`);
    return response.data;
  },

  // Get tags by company
  getTags: async () => {
    const response = await axiosInstance.get('/deal/tags/company');
    return response.data;
  },

  // Create new tag
  createTag: async (tagData: any) => {
    const response = await axiosInstance.post('/deal/tags', tagData);
    return response.data;
  }
};

// Default export for the axios instance
export default axiosInstance; 