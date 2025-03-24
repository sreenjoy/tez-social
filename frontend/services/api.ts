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
  
  // Redirect to Google OAuth
  googleAuth: () => {
    // Get the frontend URL from environment or use default
    const frontendUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://tez-social.vercel.app';
    
    // Create the callback URL for Google OAuth
    const callbackUrl = `${frontendUrl}/auth/login`;
    
    // Log what we're doing
    console.log("[API] Redirecting to Google OAuth with:");
    console.log("[API] - Backend URL:", BACKEND_URL);
    console.log("[API] - Callback URL:", callbackUrl);
    
    // Add the callback URL as a query parameter - important: no /api prefix for OAuth to work
    const redirectUrl = `${BACKEND_URL}/auth/google?redirectTo=${encodeURIComponent(callbackUrl)}`;
    
    console.log("[API] Final redirect URL:", redirectUrl);
    
    // Full page redirect to the Google OAuth endpoint
    window.location.href = redirectUrl;
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

// Default export for the axios instance
export default axiosInstance; 