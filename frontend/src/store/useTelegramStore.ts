import { create } from 'zustand';
import TelegramService from '@/lib/telegramService';

// Types
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

interface TelegramState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  contacts: Contact[];
  selectedContact: Contact | null;
  messages: Message[];
  
  // Connection functions
  checkConnection: () => Promise<boolean>;
  sendCode: (phoneNumber: string) => Promise<{ sent: boolean; codeHash?: string }>;
  verifyCode: (code: string, codeHash: string) => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  
  // Contacts and messages functions
  fetchContacts: () => Promise<void>;
  selectContact: (contactId: string) => Promise<void>;
  fetchMessages: (contactId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<boolean>;
  
  // Reset state
  resetState: () => void;
}

const useTelegramStore = create<TelegramState>((set, get) => ({
  isConnected: false,
  isLoading: false,
  error: null,
  contacts: [],
  selectedContact: null,
  messages: [],
  
  // Check if the user is connected to Telegram
  checkConnection: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const status = await TelegramService.getConnectionStatus();
      set({ isConnected: status.connected, isLoading: false });
      return status.connected;
    } catch (error) {
      console.error('Failed to check Telegram connection', error);
      set({ 
        isConnected: false, 
        isLoading: false, 
        error: 'Failed to check Telegram connection' 
      });
      return false;
    }
  },
  
  // Send verification code to the provided phone number
  sendCode: async (phoneNumber: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await TelegramService.sendCode(phoneNumber);
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error('Failed to send verification code', error);
      set({ 
        isLoading: false, 
        error: 'Failed to send verification code' 
      });
      return { sent: false };
    }
  },
  
  // Verify the code sent to the user's phone
  verifyCode: async (code: string, codeHash: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await TelegramService.verifyCode(code, codeHash);
      
      if (result.success) {
        set({ isConnected: true, isLoading: false });
        // Fetch contacts after successful connection
        get().fetchContacts();
      } else {
        set({ 
          isLoading: false, 
          error: 'Invalid verification code' 
        });
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to verify code', error);
      set({ 
        isLoading: false, 
        error: 'Failed to verify code' 
      });
      return false;
    }
  },
  
  // Disconnect from Telegram
  disconnect: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await TelegramService.disconnect();
      
      if (result.success) {
        set({ 
          isConnected: false, 
          contacts: [],
          selectedContact: null,
          messages: [],
          isLoading: false 
        });
      } else {
        set({ 
          isLoading: false, 
          error: 'Failed to disconnect from Telegram' 
        });
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to disconnect from Telegram', error);
      set({ 
        isLoading: false, 
        error: 'Failed to disconnect from Telegram' 
      });
      return false;
    }
  },
  
  // Fetch contacts from Telegram
  fetchContacts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const contacts = await TelegramService.getContacts();
      set({ contacts, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch contacts', error);
      set({ 
        isLoading: false, 
        error: 'Failed to fetch contacts' 
      });
    }
  },
  
  // Select a contact and fetch their messages
  selectContact: async (contactId: string) => {
    const { contacts } = get();
    const selectedContact = contacts.find(contact => contact.id === contactId) || null;
    
    set({ selectedContact, isLoading: true, error: null });
    
    if (selectedContact) {
      try {
        const messages = await TelegramService.getMessages(contactId);
        set({ messages, isLoading: false });
      } catch (error) {
        console.error('Failed to fetch messages', error);
        set({ 
          isLoading: false, 
          error: 'Failed to fetch messages' 
        });
      }
    } else {
      set({ messages: [], isLoading: false });
    }
  },
  
  // Fetch messages for a specific contact
  fetchMessages: async (contactId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const messages = await TelegramService.getMessages(contactId);
      set({ messages, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch messages', error);
      set({ 
        isLoading: false, 
        error: 'Failed to fetch messages' 
      });
    }
  },
  
  // Send a message to the selected contact
  sendMessage: async (text: string) => {
    const { selectedContact } = get();
    
    if (!selectedContact) {
      set({ error: 'No contact selected' });
      return false;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const result = await TelegramService.sendMessage(selectedContact.id, text);
      
      if (result.sent && result.message) {
        set(state => ({ 
          messages: [...state.messages, result.message!],
          isLoading: false 
        }));
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: 'Failed to send message' 
        });
        return false;
      }
    } catch (error) {
      console.error('Failed to send message', error);
      set({ 
        isLoading: false, 
        error: 'Failed to send message' 
      });
      return false;
    }
  },
  
  // Reset the state to its initial values
  resetState: () => {
    set({
      isConnected: false,
      isLoading: false,
      error: null,
      contacts: [],
      selectedContact: null,
      messages: [],
    });
  },
}));

export default useTelegramStore; 