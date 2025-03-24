import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
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
  providers: [TelegramService, TelegramClientService],
  exports: [TelegramService],
})
export class TelegramModule {} 