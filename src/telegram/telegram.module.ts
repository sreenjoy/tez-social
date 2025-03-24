import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { TelegramClientService } from './telegram-client.service';
import { User, UserSchema } from '../common/schemas/user.schema';
import { Deal, DealSchema } from '../common/schemas/deal.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Deal.name, schema: DealSchema },
    ]),
  ],
  controllers: [TelegramController],
  providers: [
    {
      provide: TelegramClientService,
      useFactory: (configService: ConfigService) => {
        const apiId = configService.get<string>('TELEGRAM_API_ID');
        const apiHash = configService.get<string>('TELEGRAM_API_HASH');
        
        if (!apiId || !apiHash) {
          const logger = new Logger('TelegramClientService');
          logger.warn('TELEGRAM_API_ID or TELEGRAM_API_HASH are not defined in the environment variables. Telegram features will be disabled.');
          
          // Return a mock service that doesn't try to connect to Telegram
          return {
            isConnected: () => false,
            connect: () => Promise.resolve({ success: false, message: 'Telegram integration is disabled' }),
            sendCode: () => Promise.resolve({ success: false, message: 'Telegram integration is disabled' }),
            signIn: () => Promise.resolve({ success: false, message: 'Telegram integration is disabled' }),
            getContacts: () => Promise.resolve([]),
            sendMessage: () => Promise.resolve({ success: false, message: 'Telegram integration is disabled' }),
            // Add other methods as needed
          };
        }
        
        return new TelegramClientService(configService);
      },
      inject: [ConfigService],
    },
    TelegramService,
  ],
  exports: [TelegramService, TelegramClientService],
})
export class TelegramModule {} 