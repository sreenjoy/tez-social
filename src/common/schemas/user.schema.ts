import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

// Telegram session interface
export interface TelegramSession {
  phoneNumber: string;
  phoneCodeHash?: string;
  connectedAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  is2FAEnabled?: boolean;
  telegramId?: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  googleId?: string;

  @Prop()
  telegramId?: string;

  @Prop({ type: Object })
  telegramSession?: TelegramSession;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 