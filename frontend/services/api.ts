import axios from 'axios';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://tez-social-production.up.railway.app';

// Create a custom axios instance for our API
const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage (if we're in a browser environment)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
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

// API service for authentication related endpoints
export const authApi = {
  // Register a new user
  register: async (userData: any) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  
  // Login with email and password
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },
  
  // Logout the current user
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
  
  // Get the current authenticated user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token: string) => {
    const response = await axiosInstance.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string) => {
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Get user onboarding status
  getOnboardingStatus: async () => {
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