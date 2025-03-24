import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  members: User[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  settings?: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const CompanySchema = SchemaFactory.createForClass(Company); 