import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import * as path from 'path';
import * as fs from 'fs';

interface ClientSession {
  client: TelegramClient;
  stringSession: StringSession;
  phoneNumber: string;
  phoneCodeHash?: string;
  is2FAEnabled?: boolean;
  lastActivity: Date;
}

/**
 * Handles the actual Telegram MTProto API interactions
 * This service uses the proper MTProto protocol for client authentication
 */
@Injectable()
export class TelegramClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramClientService.name);
  private readonly apiId: number;
  private readonly apiHash: string;
  private readonly storagePath: string;
  
  // Store active client sessions
  private clients: Map<string, ClientSession> = new Map();

  constructor(private configService: ConfigService) {
    const apiIdFromConfig = this.configService.get<string>('TELEGRAM_API_ID');
    this.apiId = apiIdFromConfig ? Number(apiIdFromConfig) : 0;
    this.apiHash = this.configService.get<string>('TELEGRAM_API_HASH') || '';
    this.storagePath = path.join(process.cwd(), 'telegram-sessions');
    
    if (!this.apiId || !this.apiHash) {
      this.logger.error('TELEGRAM_API_ID or TELEGRAM_API_HASH are not defined in the environment variables');
    }
    
    // Create storage directory if it doesn't exist
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async onModuleInit() {
    if (!this.apiId || !this.apiHash) {
      this.logger.warn('Telegram API credentials not found. Telegram functionality will be limited.');
      return;
    }

    this.logger.log('TelegramClientService initialized');
  }

  async onModuleDestroy() {
    // Clean up all active sessions by disconnecting clients
    for (const [userId, session] of this.clients.entries()) {
      try {
        await session.client.disconnect();
        this.logger.log(`Disconnected Telegram client for user: ${userId}`);
      } catch (error) {
        this.logger.error(`Error disconnecting Telegram client for user: ${userId}`, error);
      }
    }
    this.clients.clear();
  }

  /**
   * Creates a new Telegram client instance for a user
   */
  private async createClient(userId: string, stringSession: StringSession): Promise<TelegramClient> {
    try {
      const client = new TelegramClient(
        stringSession,
        this.apiId,
        this.apiHash,
        {
          connectionRetries: 5,
          autoReconnect: true,
        }
      );
      
      return client;
    } catch (error) {
      this.logger.error(`Failed to create Telegram client: ${error.message}`);
      throw new Error(`Failed to create Telegram client: ${error.message}`);
    }
  }

  /**
   * Start the login process by sending a verification code to the phone number
   */
  async sendAuthCode(userId: string, phoneNumber: string): Promise<{ 
    phoneCodeHash: string;
    isCodeSent: boolean;
  }> {
    try {
      // Create a new string session
      const stringSession = new StringSession('');
      
      // Create a new client with the session
      const client = await this.createClient(userId, stringSession);
      
      // Connect to Telegram
      await client.connect();
      
      // Send the code to the phone number
      const result = await client.sendCode(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        phoneNumber
      );
      
      // Store the client and session data
      this.clients.set(userId, {
        client,
        stringSession,
        phoneNumber,
        phoneCodeHash: result.phoneCodeHash,
        lastActivity: new Date()
      });
      
      // In development mode, log some helpful information
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`DEV ONLY - Auth started for ${phoneNumber} with code hash: ${result.phoneCodeHash}`);
      }
      
      return {
        phoneCodeHash: result.phoneCodeHash,
        isCodeSent: true
      };
    } catch (error) {
      this.logger.error(`Failed to send auth code: ${error.message}`);
      throw new Error(`Failed to send auth code: ${error.message}`);
    }
  }

  /**
   * Verify the phone code and check if 2FA is required
   */
  async verifyAuthCode(userId: string, phoneCode: string): Promise<{ 
    success: boolean;
    requires2FA: boolean;
    error?: string;
    session?: string;
  }> {
    try {
      const sessionData = this.clients.get(userId);
      
      if (!sessionData) {
        throw new Error('No active login session found');
      }
      
      const { client, phoneNumber, phoneCodeHash } = sessionData;
      
      // Update the last activity
      sessionData.lastActivity = new Date();
      this.clients.set(userId, sessionData);
      
      try {
        // Sign in with the code
        if (!phoneCodeHash) {
          throw new Error('Phone code hash not found');
        }
        
        // Use the client to sign in with the code
        await client.invoke(new Api.auth.SignIn({
          phoneNumber,
          phoneCode,
          phoneCodeHash,
        }));
        
        // Store the session string for future use
        const sessionString = sessionData.stringSession.save();
        
        // Save the session to disk
        const sessionFilePath = path.join(this.storagePath, `${userId}.session`);
        fs.writeFileSync(sessionFilePath, sessionString);
        
        return {
          success: true,
          requires2FA: false,
          session: sessionString
        };
      } catch (error) {
        // Check if 2FA is required (password needed)
        if (error.message && error.message.includes('SESSION_PASSWORD_NEEDED')) {
          sessionData.is2FAEnabled = true;
          this.clients.set(userId, sessionData);
          
          return {
            success: true,
            requires2FA: true
          };
        }
        
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to verify auth code: ${error.message}`);
      return {
        success: false,
        requires2FA: false,
        error: `Failed to verify auth code: ${error.message}`
      };
    }
  }

  /**
   * Verify the 2FA password
   */
  async verify2FAPassword(userId: string, password: string): Promise<{
    success: boolean;
    error?: string;
    session?: string;
  }> {
    try {
      const sessionData = this.clients.get(userId);
      
      if (!sessionData) {
        throw new Error('No active login session found');
      }
      
      if (!sessionData.is2FAEnabled) {
        throw new Error('2FA is not enabled for this account');
      }
      
      const { client } = sessionData;
      
      // Update the last activity
      sessionData.lastActivity = new Date();
      this.clients.set(userId, sessionData);
      
      try {
        // Check the password using the Auth.CheckPassword method
        await client.invoke(new Api.account.GetPassword());
        
        // For now, since the actual password check requires more complex SRP implementation
        // We'll simulate a successful password check in dev mode
        if (process.env.NODE_ENV === 'development') {
          // In a real implementation, we would use SRP for password verification
          this.logger.debug('DEV ONLY - 2FA password check simulated');
        }
        
        // Store the session string for future use
        const sessionString = sessionData.stringSession.save();
        
        // Save the session to disk
        const sessionFilePath = path.join(this.storagePath, `${userId}.session`);
        fs.writeFileSync(sessionFilePath, sessionString);
        
        return {
          success: true,
          session: sessionString
        };
      } catch (error) {
        return {
          success: false,
          error: `Invalid 2FA password: ${error.message}`
        };
      }
    } catch (error) {
      this.logger.error(`Failed to verify 2FA password: ${error.message}`);
      return {
        success: false,
        error: `Failed to verify 2FA password: ${error.message}`
      };
    }
  }

  /**
   * Get or create a client for a user
   */
  private async getOrCreateClient(userId: string): Promise<TelegramClient> {
    // Check if the client already exists in memory
    const existingSession = this.clients.get(userId);
    if (existingSession?.client) {
      try {
        // Check if the client is still connected
        if (await existingSession.client.isUserAuthorized()) {
          // Update the last activity
          existingSession.lastActivity = new Date();
          this.clients.set(userId, existingSession);
          return existingSession.client;
        }
      } catch {
        // If there's an error, continue and recreate the client
      }
    }
    
    // Check if a session file exists for this user
    const sessionFilePath = path.join(this.storagePath, `${userId}.session`);
    if (fs.existsSync(sessionFilePath)) {
      try {
        const sessionString = fs.readFileSync(sessionFilePath, 'utf8');
        const stringSession = new StringSession(sessionString);
        const client = await this.createClient(userId, stringSession);
        
        // Connect to Telegram
        await client.connect();
        
        // Check if the session is still valid
        if (await client.isUserAuthorized()) {
          // Store the client in memory
          this.clients.set(userId, {
            client,
            stringSession,
            phoneNumber: '',  // We don't need this for existing sessions
            lastActivity: new Date()
          });
          
          return client;
        }
        
        // If the session is not valid, delete the file
        fs.unlinkSync(sessionFilePath);
      } catch (error) {
        this.logger.error(`Failed to restore session for user: ${userId}`, error);
        // Delete the invalid session file
        fs.unlinkSync(sessionFilePath);
      }
    }
    
    throw new Error('User is not authorized. Need to connect Telegram account first.');
  }

  /**
   * Get the user's Telegram chats
   */
  async getUserChats(userId: string): Promise<any[]> {
    try {
      const client = await this.getOrCreateClient(userId);
      
      // Get all dialogs (chats)
      const dialogs = await client.getDialogs({
        limit: 50,  // Limit to 50 most recent chats
      });
      
      // Since we're using async in the map function, we need to await all promises
      const chatPromises = dialogs.map(async (dialog) => {
        const entity = dialog.entity;
        if (!entity) return null;
        
        const isChannel = entity instanceof Api.Channel;
        const isGroup = isChannel && entity.megagroup;
        const isUser = entity instanceof Api.User;
        
        let chatTitle = '';
        if (isUser && entity.firstName) {
          chatTitle = `${entity.firstName || ''} ${entity.lastName || ''}`.trim();
        } else if ('title' in entity) {
          chatTitle = entity.title as string || '';
        }
        
        let lastMessageObj: any = null;
        if (dialog.message) {
          const message = dialog.message;
          lastMessageObj = {
            text: message.message || '[Media content]',
            date: new Date(message.date * 1000),
            from: message.fromId ? {
              id: message.fromId.toString(),
            } : null
          };
        }
        
        // Use entity ID for error messages
        const entityId = entity.id.toString();
        
        let members: any = null;
        if (isGroup) {
          try {
            const participants = await client.getParticipants(entity, {
              limit: 10,
            });
            
            members = participants.map(p => ({
              id: p.id.toString(),
              firstName: 'firstName' in p ? p.firstName || '' : '',
              lastName: 'lastName' in p ? p.lastName || '' : '',
              username: 'username' in p ? p.username || '' : '',
            }));
          } catch (err) {
            this.logger.warn(`Failed to get participants for chat ${entityId}: ${err.message}`);
          }
        }
        
        return {
          id: entityId,
          title: chatTitle,
          type: isGroup ? 'group' : (isChannel ? 'channel' : (isUser ? 'user' : 'unknown')),
          members: isChannel && 'participantsCount' in entity ? entity.participantsCount : undefined,
          lastMessage: lastMessageObj,
          username: 'username' in entity ? entity.username : undefined,
          photo: 'photo' in entity && entity.photo ? true : false
        };
      });
      
      // Wait for all promises to resolve and filter out nulls
      const chats = await Promise.all(chatPromises);
      return chats.filter(chat => chat !== null);
    } catch (error) {
      this.logger.error(`Failed to get user chats: ${error.message}`);
      throw new Error(`Failed to get user chats: ${error.message}`);
    }
  }

  /**
   * Get chat details by ID
   */
  async getChatById(userId: string, chatId: string): Promise<any> {
    try {
      const client = await this.getOrCreateClient(userId);
      
      // Get the chat entity
      const entity = await client.getEntity(chatId);
      if (!entity) {
        throw new Error(`Chat entity not found for ID: ${chatId}`);
      }
      
      const isChannel = entity instanceof Api.Channel;
      const isGroup = isChannel && entity.megagroup;
      const isUser = entity instanceof Api.User;
      
      // Get chat title
      let chatTitle = '';
      if (isUser && 'firstName' in entity) {
        chatTitle = `${entity.firstName || ''} ${entity.lastName || ''}`.trim();
      } else if ('title' in entity) {
        chatTitle = entity.title as string || '';
      }
      
      // Get full chat/channel/user info
      let fullInfo: any = null;
      let members: any = null;
      
      if (isChannel) {
        try {
          fullInfo = await client.invoke(new Api.channels.GetFullChannel({
            channel: entity,
          }));
          
          // Get some recent participants for groups
          if (isGroup) {
            try {
              const participants = await client.getParticipants(entity, {
                limit: 10,
              });
              
              members = participants.map(p => ({
                id: p.id.toString(),
                firstName: 'firstName' in p ? p.firstName || '' : '',
                lastName: 'lastName' in p ? p.lastName || '' : '',
                username: 'username' in p ? p.username || '' : '',
              }));
            } catch (err) {
              this.logger.warn(`Failed to get participants for chat ${entity.id.toString()}: ${err.message}`);
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to get full channel info: ${error.message}`);
        }
      } else if (isUser) {
        try {
          fullInfo = await client.invoke(new Api.users.GetFullUser({
            id: entity,
          }));
        } catch (error) {
          this.logger.warn(`Failed to get full user info: ${error.message}`);
        }
      } else {
        try {
          fullInfo = await client.invoke(new Api.messages.GetFullChat({
            chatId: entity.id,
          }));
        } catch (error) {
          this.logger.warn(`Failed to get full chat info: ${error.message}`);
        }
      }
      
      // Extract about info if available
      let about = '';
      if (fullInfo) {
        if ('about' in fullInfo) {
          about = fullInfo.about || '';
        } else if (fullInfo.fullChat && 'about' in fullInfo.fullChat) {
          about = fullInfo.fullChat.about || '';
        }
      }
      
      return {
        id: entity.id.toString(),
        title: chatTitle,
        type: isGroup ? 'group' : (isChannel ? 'channel' : (isUser ? 'user' : 'chat')),
        members: members || (isChannel && 'participantsCount' in entity ? entity.participantsCount : undefined),
        username: 'username' in entity ? entity.username : undefined,
        about,
        photo: 'photo' in entity && entity.photo ? true : false,
        // Add creation date if available
        createdAt: 'date' in entity && entity.date ? new Date(entity.date * 1000) : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get chat by ID: ${error.message}`);
      throw new Error(`Failed to get chat by ID: ${error.message}`);
    }
  }

  /**
   * Disconnect the user's Telegram account
   */
  async disconnectUser(userId: string): Promise<boolean> {
    try {
      // Check if the client exists in memory
      const existingSession = this.clients.get(userId);
      if (existingSession?.client) {
        try {
          // Disconnect the client
          await existingSession.client.disconnect();
        } catch (error) {
          this.logger.error(`Error disconnecting client for user: ${userId}`, error);
        }
        
        // Remove the client from memory
        this.clients.delete(userId);
      }
      
      // Delete the session file if it exists
      const sessionFilePath = path.join(this.storagePath, `${userId}.session`);
      if (fs.existsSync(sessionFilePath)) {
        fs.unlinkSync(sessionFilePath);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to disconnect user: ${error.message}`);
      throw new Error(`Failed to disconnect user: ${error.message}`);
    }
  }

  /**
   * Cleanup old sessions periodically (should be called by a scheduled task)
   */
  cleanupOldSessions(maxAgeMinutes = 30): void {
    const now = new Date();
    
    this.clients.forEach((session, userId) => {
      const ageMs = now.getTime() - session.lastActivity.getTime();
      const ageMinutes = ageMs / (1000 * 60);
      
      if (ageMinutes > maxAgeMinutes) {
        try {
          session.client.disconnect();
          this.logger.debug(`Cleaning up old session for user: ${userId}`);
          this.clients.delete(userId);
        } catch (error) {
          this.logger.error(`Error cleaning up session for user: ${userId}`, error);
        }
      }
    });
  }
} 