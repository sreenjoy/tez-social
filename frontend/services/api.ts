import axios from 'axios';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://tez-social-production.up.railway.app';

// Create a custom axios instance for our API
const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
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
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },
  
  // Login with email and password
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  // Logout the current user
  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  },
  
  // Get the current authenticated user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },
};

// API service for user related endpoints
export const userApi = {
  // Get user profile
  getProfile: async (userId: string) => {
    const response = await axiosInstance.get(`/api/users/${userId}`);
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userId: string, profileData: any) => {
    const response = await axiosInstance.patch(`/api/users/${userId}`, profileData);
    return response.data;
  },
  
  // Get followers
  getFollowers: async (userId: string) => {
    const response = await axiosInstance.get(`/api/users/${userId}/followers`);
    return response.data;
  },
  
  // Get following
  getFollowing: async (userId: string) => {
    const response = await axiosInstance.get(`/api/users/${userId}/following`);
    return response.data;
  },
};

// API service for post related endpoints
export const postApi = {
  // Get feed posts
  getFeed: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/api/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // Create a new post
  createPost: async (postData: any) => {
    const response = await axiosInstance.post('/api/posts', postData);
    return response.data;
  },
  
  // Get a single post
  getPost: async (postId: string) => {
    const response = await axiosInstance.get(`/api/posts/${postId}`);
    return response.data;
  },
  
  // Delete a post
  deletePost: async (postId: string) => {
    const response = await axiosInstance.delete(`/api/posts/${postId}`);
    return response.data;
  },
  
  // Like a post
  likePost: async (postId: string) => {
    const response = await axiosInstance.post(`/api/posts/${postId}/like`);
    return response.data;
  },
  
  // Unlike a post
  unlikePost: async (postId: string) => {
    const response = await axiosInstance.delete(`/api/posts/${postId}/like`);
    return response.data;
  },
  
  // Get post comments
  getComments: async (postId: string, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/api/posts/${postId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // Add a comment to a post
  addComment: async (postId: string, content: string) => {
    const response = await axiosInstance.post(`/api/posts/${postId}/comments`, { content });
    return response.data;
  },
};

// API service for Telegram integration
export const telegramApi = {
  // Get connection status
  getConnectionStatus: async () => {
    const response = await axiosInstance.get('/api/telegram/status');
    return response.data;
  },
  
  // Connect Telegram account with phone number
  connect: async (phoneNumber: string) => {
    const response = await axiosInstance.post('/api/telegram/connect', { phoneNumber });
    return response.data;
  },
  
  // Verify code sent to Telegram
  verifyCode: async (code: string) => {
    const response = await axiosInstance.post('/api/telegram/verify', { code });
    return response.data;
  },
  
  // Get Telegram contacts
  getContacts: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get(`/api/telegram/contacts?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Default export for the axios instance
export default axiosInstance; 