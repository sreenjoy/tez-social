import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

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
  telegramSession?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 