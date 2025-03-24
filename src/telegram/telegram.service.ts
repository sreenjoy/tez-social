import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User, UserDocument } from '../common/schemas/user.schema';
import { Deal, DealDocument } from '../common/schemas/deal.schema';
import { ConnectTelegramDto } from './dto/connect-telegram.dto';
import { LinkChatDto } from './dto/link-chat.dto';
import { TelegramClientService } from './telegram-client.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private configService: ConfigService,
    private telegramClientService: TelegramClientService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Deal.name) private dealModel: Model<DealDocument>,
  ) {}

  /**
   * Start the process of connecting a user's Telegram account
   * This now uses the TelegramClientService to handle the actual API interactions
   */
  async connectTelegram(userId: string, connectDto: ConnectTelegramDto): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Use the TelegramClientService to send the auth code
      const { phoneCodeHash, isCodeSent } = await this.telegramClientService.sendAuthCode(
        userId,
        connectDto.phoneNumber
      );
      
      if (!isCodeSent) {
        throw new BadRequestException('Failed to send auth code to Telegram');
      }
      
      // Update user with telegram connection info
      const telegramSession = {
        phoneNumber: connectDto.phoneNumber,
        phoneCodeHash, // Store the phone code hash for verification
        connectedAt: new Date(),
        verified: false
      };
      
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { telegramSession } }
      );
      
      return {
        status: 'pending',
        message: 'Phone code sent to Telegram. Please submit the code to complete the connection.',
      };
    } catch (error) {
      this.logger.error(`Failed to connect Telegram: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to connect Telegram account');
    }
  }

  /**
   * Verify the phone code and handle 2FA if needed
   */
  async verifyPhoneCode(userId: string, phoneCode: string, password?: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      if (!user.telegramSession) {
        throw new BadRequestException('No pending Telegram connection found');
      }
      
      // If a 2FA password is provided, verify it instead of the phone code
      if (password && user.telegramSession.is2FAEnabled) {
        const { success, error } = await this.telegramClientService.verify2FAPassword(userId, password);
        
        if (!success) {
          throw new BadRequestException(error || 'Invalid 2FA password');
        }
        
        // Update user session as verified
        const telegramSession = {
          ...user.telegramSession,
          verified: true,
          verifiedAt: new Date(),
        };
        
        await this.userModel.updateOne(
          { _id: userId },
          { $set: { telegramSession } }
        );
        
        return {
          status: 'connected',
          message: 'Telegram account successfully connected with 2FA',
        };
      }
      
      // Verify the phone code
      const { success, requires2FA, error } = await this.telegramClientService.verifyAuthCode(userId, phoneCode);
      
      if (!success) {
        throw new BadRequestException(error || 'Invalid phone code');
      }
      
      // If 2FA is required, update the user session and return the status
      if (requires2FA) {
        await this.userModel.updateOne(
          { _id: userId },
          { $set: { 'telegramSession.is2FAEnabled': true } }
        );
        
        return {
          status: '2fa_required',
          message: 'Two-factor authentication is enabled. Please provide your 2FA password.',
        };
      }
      
      // Update user session as verified
      const telegramSession = {
        ...user.telegramSession,
        verified: true,
        verifiedAt: new Date(),
        is2FAEnabled: false,
      };
      
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { telegramSession } }
      );
      
      return {
        status: 'connected',
        message: 'Telegram account successfully connected',
      };
    } catch (error) {
      this.logger.error(`Failed to verify phone code: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to verify phone code');
    }
  }

  /**
   * Link a Telegram chat to a deal
   */
  async linkChatToDeal(userId: string, linkChatDto: LinkChatDto): Promise<Deal | null> {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      if (!user.telegramSession?.verified) {
        throw new BadRequestException('Telegram account not connected or not verified');
      }
      
      const deal = await this.dealModel.findOne({
        _id: linkChatDto.dealId,
        createdBy: userId,
        isActive: true,
      });
      
      if (!deal) {
        throw new NotFoundException(`Deal with ID ${linkChatDto.dealId} not found`);
      }
      
      // Get the chat details to verify it exists
      try {
        const chatDetails = await this.telegramClientService.getChatById(userId, linkChatDto.chatId);
        
        // Update the deal with the chat ID and details
        const updatedDeal = await this.dealModel.findByIdAndUpdate(
          linkChatDto.dealId,
          { 
            $set: { 
              telegramChatId: linkChatDto.chatId,
              telegramChatInfo: {
                linkedAt: new Date(),
                linkedBy: userId,
                chatName: chatDetails.title || `Chat ${linkChatDto.chatId}`,
                chatType: chatDetails.type,
                members: chatDetails.members,
              }
            } 
          },
          { new: true }
        );
        
        if (!updatedDeal) {
          throw new NotFoundException(`Deal with ID ${linkChatDto.dealId} not found after update`);
        }
        
        return updatedDeal;
      } catch (error) {
        throw new BadRequestException(`Chat with ID ${linkChatDto.chatId} not found or not accessible`);
      }
    } catch (error) {
      this.logger.error(`Failed to link chat to deal: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to link Telegram chat to deal');
    }
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId: string): Promise<any[]> {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      if (!user.telegramSession?.verified) {
        throw new BadRequestException('Telegram account not connected or not verified');
      }
      
      // Use the TelegramClientService to get the user's chats
      return await this.telegramClientService.getUserChats(userId);
    } catch (error) {
      this.logger.error(`Failed to get user chats: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve Telegram chats');
    }
  }

  /**
   * Disconnect the user's Telegram account
   */
  async disconnectTelegram(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      if (!user.telegramSession) {
        throw new BadRequestException('No Telegram connection found');
      }
      
      // Use the TelegramClientService to disconnect the user
      await this.telegramClientService.disconnectUser(userId);
      
      // Update user to remove Telegram connection info
      await this.userModel.updateOne(
        { _id: userId },
        { $unset: { telegramSession: 1, telegramId: 1 } }
      );
      
      // Update deals to remove Telegram chat links for this user
      await this.dealModel.updateMany(
        { createdBy: userId, telegramChatId: { $exists: true } },
        { $unset: { telegramChatId: 1, telegramChatInfo: 1 } }
      );
      
      return {
        status: 'disconnected',
        message: 'Telegram account successfully disconnected',
      };
    } catch (error) {
      this.logger.error(`Failed to disconnect Telegram: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to disconnect Telegram account');
    }
  }
} 