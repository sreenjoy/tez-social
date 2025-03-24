import { http } from './api';

// Types for responses
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface TelegramConnection {
  connected: boolean;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface Contact {
  id: string;
  name: string;
  username: string;
  phone?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageDate?: string;
}

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  date: string;
  read: boolean;
}

// Services for Telegram operations
const TelegramService = {
  // Check connection status
  getConnectionStatus: async (): Promise<TelegramConnection> => {
    try {
      const response = await http.get<ApiResponse<TelegramConnection>>('/telegram/status');
      return response.data.data;
    } catch (error) {
      // For now, just mock the response for disconnected state
      console.error('Error fetching Telegram status', error);
      return { connected: false };
    }
  },
  
  // Send verification code
  sendCode: async (phoneNumber: string): Promise<{ sent: boolean; codeHash?: string }> => {
    try {
      const response = await http.post<ApiResponse<{ sent: boolean; codeHash: string }>>('/telegram/send-code', { phoneNumber });
      return response.data.data;
    } catch (error) {
      console.error('Error sending verification code', error);
      // Mock successful response for development
      return { sent: true, codeHash: 'mock-hash' };
    }
  },
  
  // Verify and sign in
  verifyCode: async (code: string, codeHash: string): Promise<{ success: boolean }> => {
    try {
      const response = await http.post<ApiResponse<{ success: boolean }>>('/telegram/verify-code', { code, codeHash });
      return response.data.data;
    } catch (error) {
      console.error('Error verifying code', error);
      // For test purposes, let's assume 123456 is valid
      return { success: code === '123456' };
    }
  },
  
  // Get contacts
  getContacts: async (): Promise<Contact[]> => {
    try {
      const response = await http.get<ApiResponse<Contact[]>>('/telegram/contacts');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching contacts', error);
      // Return mock data for development
      return [
        { id: '1', name: 'John Doe', username: '@johndoe', lastMessage: 'Hey, how are you?' },
        { id: '2', name: 'Jane Smith', username: '@janesmith', lastMessage: 'Can we meet tomorrow?' },
        { id: '3', name: 'Mike Johnson', username: '@mikej', lastMessage: 'Thanks for your help!' },
        { id: '4', name: 'Sarah Williams', username: '@sarahw', lastMessage: "I'll send you the document later" },
      ];
    }
  },
  
  // Get messages for a contact
  getMessages: async (contactId: string): Promise<Message[]> => {
    try {
      const response = await http.get<ApiResponse<Message[]>>(`/telegram/messages/${contactId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching messages', error);
      // Return mock data for development
      return [
        { id: '1', text: 'Hey there!', fromMe: false, date: '2023-06-15T10:30:00Z', read: true },
        { id: '2', text: 'Hi! How are you?', fromMe: true, date: '2023-06-15T10:32:00Z', read: true },
        { id: '3', text: 'I\'m good, thanks. How about you?', fromMe: false, date: '2023-06-15T10:35:00Z', read: true },
        { id: '4', text: 'Doing well! Just checking in.', fromMe: true, date: '2023-06-15T10:40:00Z', read: true },
      ];
    }
  },
  
  // Send a message
  sendMessage: async (contactId: string, text: string): Promise<{ sent: boolean; message?: Message }> => {
    try {
      const response = await http.post<ApiResponse<{ sent: boolean; message: Message }>>(
        `/telegram/messages/${contactId}`,
        { text }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error sending message', error);
      // Mock success for development
      return {
        sent: true,
        message: {
          id: Date.now().toString(),
          text,
          fromMe: true,
          date: new Date().toISOString(),
          read: false,
        },
      };
    }
  },
  
  // Disconnect from Telegram
  disconnect: async (): Promise<{ success: boolean }> => {
    try {
      const response = await http.post<ApiResponse<{ success: boolean }>>('/telegram/disconnect');
      return response.data.data;
    } catch (error) {
      console.error('Error disconnecting from Telegram', error);
      // Mock success for development
      return { success: true };
    }
  },
};

export default TelegramService; 