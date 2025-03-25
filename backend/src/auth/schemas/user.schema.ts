import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  picture?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;
  
  @Prop()
  verificationToken?: string;
  
  @Prop()
  verificationTokenExpires?: Date;
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  companyId?: MongooseSchema.Types.ObjectId;
  
  @Prop({ default: false })
  hasCompletedOnboarding: boolean;

  @Prop({ default: Date.now })
  lastActive: Date;

  // Method to safely return user details without sensitive info
  toSafeObject() {
    const { password, verificationToken, verificationTokenExpires, __v, ...safeUser } = this.toObject();
    return safeUser;
  }
}

export const UserSchema = SchemaFactory.createForClass(User); 