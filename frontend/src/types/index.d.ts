// Type declarations for the application

// API Response types
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserData;
}

// User types
export interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Telegram types
export interface TelegramConnectionRequest {
  phoneNumber: string;
}

export interface TelegramCodeConfirmRequest {
  code: string;
  phoneNumber: string;
}

export interface TelegramConnection {
  id: string;
  userId: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 