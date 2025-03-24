import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName?: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  picture?: string;

  // Method to safely return user details without sensitive info
  toSafeObject() {
    const { password, __v, ...safeUser } = this.toObject();
    return safeUser;
  }
}

export const UserSchema = SchemaFactory.createForClass(User); 