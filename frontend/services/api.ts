import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import useAuthStore from '../store/authStore';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tez-social-production.up.railway.app';

console.log('API client connecting to:', BACKEND_URL);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Create a custom axios instance for our API
const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Add a request interceptor to include the auth token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors consistently
axiosInstance.interceptors.response.use(
  (response) => {
    // Extract data from response to match expected format
    if (response.data && typeof response.data === 'object') {
      // NestJS wraps responses in a data field with metadata
      if (response.data.data !== undefined) {
        return { ...response, data: response.data.data };
      }
    }
    return response;
  },
  async (error) => {
    // Create a standardized error object
    const errorResponse: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      statusCode: 500
    };

    if (!error.response) {
      // Network errors
      errorResponse.error = 'Network error. Please check your connection and try again.';
      return Promise.reject(errorResponse);
    }

    // Extract status code
    errorResponse.statusCode = error.response.status;

    // Handle specific error status codes
    switch (error.response.status) {
      case 400: // Bad request
        errorResponse.error = error.response.data?.message || 'Invalid request. Please check your data.';
        break;
      case 401: // Unauthorized
        // For login attempts, just return the proper error
        if (error.config.url === '/auth/login') {
          errorResponse.error = 'Invalid email or password.';
        } else {
          // For other requests, session might be expired
          errorResponse.error = 'Your session has expired. Please log in again.';
          // Clear authentication state
          if (typeof window !== 'undefined') {
            useAuthStore.getState().logout();
          }
        }
        break;
      case 403: // Forbidden
        errorResponse.error = 'You do not have permission to access this resource.';
        break;
      case 404: // Not found
        errorResponse.error = 'The requested resource was not found.';
        break;
      case 422: // Validation error
        errorResponse.error = error.response.data?.message || 'Validation error. Please check your data.';
        break;
      case 429: // Too many requests
        errorResponse.error = 'Too many requests. Please try again later.';
        break;
      case 500: // Server error
      case 502: // Bad gateway
      case 503: // Service unavailable
      case 504: // Gateway timeout
        errorResponse.error = 'Server error. Please try again later.';
        break;
      default:
        errorResponse.error = error.response.data?.message || 'An unexpected error occurred. Please try again.';
    }

    return Promise.reject(errorResponse);
  }
);

// Generic API request method
const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  options?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const config: AxiosRequestConfig = {
      ...options,
      method,
      url,
    };

    if (data) {
      config.data = data;
    }

    const response = await axiosInstance(config);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if ((error as ApiResponse).success === false) {
      return error as ApiResponse;
    }

    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// API service for authentication related endpoints
export const authApi = {
  // Register a new user
  register: async (userData: any): Promise<any> => {
    const response = await apiRequest<any>('POST', '/auth/register', userData);
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },
  
  // Login with email and password
  login: async (email: string, password: string): Promise<any> => {
    console.log('Login request for:', email);
    
    const response = await apiRequest<any>('POST', '/auth/login', { email, password });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    if (!response.data?.accessToken || !response.data?.user) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid server response. Please contact support.');
    }
    
    return response.data;
  },
  
  // Logout the current user
  logout: async (): Promise<any> => {
    try {
      const response = await apiRequest<any>('POST', '/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Return success anyway so we can clean up local state
      return { success: true };
    }
  },
  
  // Get the current authenticated user
  getCurrentUser: async (): Promise<any> => {
    const response = await apiRequest<any>('GET', '/auth/me');
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<any> => {
    const response = await apiRequest<any>('POST', '/auth/verify-email', { token });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<any> => {
    const response = await apiRequest<any>('POST', '/auth/resend-verification', { email });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },

  // Get onboarding status
  getOnboardingStatus: async (): Promise<any> => {
    const response = await apiRequest<any>('GET', '/auth/onboarding-status');
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },

  // Complete onboarding
  completeOnboarding: async (data: any): Promise<any> => {
    const response = await apiRequest<any>('POST', '/auth/complete-onboarding', data);
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<any> => {
    const response = await apiRequest<any>('POST', '/auth/forgot-password', { email });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, password: string): Promise<any> => {
    const response = await apiRequest<any>('POST', '/auth/reset-password', { token, password });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  }
};

// API service for user related endpoints
export const userApi = {
  // Update user profile
  updateProfile: async (data: any): Promise<any> => {
    const response = await apiRequest<any>('PUT', '/users/profile', data);
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },
  
  // Get user profile
  getProfile: async (): Promise<any> => {
    const response = await apiRequest<any>('GET', '/users/profile');
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  },
  
  // Upload avatar
  uploadAvatar: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiRequest<any>(
      'POST', 
      '/users/avatar', 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  }
};

// API service for company related endpoints
export const companyApi = {
  // Create a new company
  createCompany: async (companyData: any) => {
    const response = await apiRequest<any>('POST', '/company', companyData);
    return response.data;
  },
  
  // Get current user's company
  getCurrentCompany: async () => {
    const response = await apiRequest<any>('GET', '/company');
    return response.data;
  },
  
  // Get company by ID
  getCompanyById: async (companyId: string) => {
    const response = await apiRequest<any>('GET', `/company/${companyId}`);
    return response.data;
  }
};

// API service for pipeline related endpoints
export const pipelineApi = {
  // Get all pipelines for the current user's company
  getPipelines: async () => {
    const response = await apiRequest<any>('GET', '/pipeline');
    return response.data;
  },
  
  // Get the default pipeline for the company
  getDefaultPipeline: async () => {
    const response = await apiRequest<any>('GET', '/pipeline/default');
    return response.data;
  },
  
  // Get a specific pipeline by ID
  getPipelineById: async (pipelineId: string) => {
    const response = await apiRequest<any>('GET', `/pipeline/${pipelineId}`);
    return response.data;
  },
  
  // Create a new pipeline
  createPipeline: async (pipelineData: any) => {
    const response = await apiRequest<any>('POST', '/pipeline', pipelineData);
    return response.data;
  },
  
  // Get all stages for a pipeline
  getPipelineStages: async (pipelineId: string) => {
    const response = await apiRequest<any>('GET', `/pipeline/${pipelineId}/stages`);
    return response.data;
  },
  
  // Create a new stage in a pipeline
  createStage: async (pipelineId: string, stageData: any) => {
    const response = await apiRequest<any>('POST', `/pipeline/${pipelineId}/stages`, stageData);
    return response.data;
  },
  
  // Reorder stages in a pipeline
  reorderStages: async (pipelineId: string, stageOrder: string[]) => {
    const response = await apiRequest<any>('PUT', `/pipeline/${pipelineId}/stages/reorder`, { order: stageOrder });
    return response.data;
  }
};

// API service for deal related endpoints
export const dealApi = {
  // Get deals by stage
  getDealsByStage: async (stageId: string) => {
    const response = await apiRequest<any>('GET', `/deal/by-stage/${stageId}`);
    return response.data;
  },
  
  // Get deals by pipeline
  getDealsByPipeline: async (pipelineId: string) => {
    const response = await apiRequest<any>('GET', `/deal/by-pipeline/${pipelineId}`);
    return response.data;
  },
  
  // Get deal by ID
  getDealById: async (id: string) => {
    const response = await apiRequest<any>('GET', `/deal/${id}`);
    return response.data;
  },
  
  // Create new deal
  createDeal: async (dealData: any) => {
    const response = await apiRequest<any>('POST', '/deal', dealData);
    return response.data;
  },
  
  // Update deal
  updateDeal: async (id: string, updateData: any) => {
    const response = await apiRequest<any>('PUT', `/deal/${id}`, updateData);
    return response.data;
  },
  
  // Move deal to stage
  moveDealToStage: async (id: string, stageId: string) => {
    const response = await apiRequest<any>('PUT', `/deal/${id}/move`, { stageId });
    return response.data;
  },
  
  // Delete deal
  deleteDeal: async (id: string) => {
    const response = await apiRequest<any>('DELETE', `/deal/${id}`);
    return response.data;
  },
  
  // Get tags by company
  getTags: async () => {
    const response = await apiRequest<any>('GET', '/deal/tags/company');
    return response.data;
  },
  
  // Create new tag
  createTag: async (tagData: any) => {
    const response = await apiRequest<any>('POST', '/deal/tags', tagData);
    return response.data;
  }
};

// API service for Telegram integration
export const telegramApi = {
  // Get connection status
  getConnectionStatus: async () => {
    const response = await apiRequest<any>('GET', '/telegram/status');
    return response.data;
  },
  
  // Connect Telegram account with phone number
  connect: async (phoneNumber: string) => {
    const response = await apiRequest<any>('POST', '/telegram/connect', { phoneNumber });
    return response.data;
  },
  
  // Verify code sent to Telegram
  verifyCode: async (code: string) => {
    const response = await apiRequest<any>('POST', '/telegram/verify', { code });
    return response.data;
  },
  
  // Get Telegram contacts
  getContacts: async (page = 1, limit = 20) => {
    const response = await apiRequest<any>('GET', `/telegram/contacts?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Default export for the axios instance
export default axiosInstance; 