import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum TeamSize {
  SOLO = 'Solo entrepreneur',
  SMALL = '2-10 employees',
  MEDIUM = '11-50 employees',
  LARGE = '51-200 employees',
  ENTERPRISE = '201+ employees'
}

export enum Purpose {
  LEAD_MANAGEMENT = 'Lead management',
  CUSTOMER_SUPPORT = 'Customer support',
  SALES_PROCESS = 'Sales process',
  COMMUNITY_MANAGEMENT = 'Community management',
  PRODUCT_FEEDBACK = 'Product feedback',
  OTHER = 'Other'
}

export enum UserRole {
  OWNER = 'Owner/Founder',
  EXECUTIVE = 'Executive/C-level',
  MANAGER = 'Manager',
  SALES = 'Sales representative',
  MARKETING = 'Marketing professional',
  SUPPORT = 'Support specialist',
  DEVELOPER = 'Developer',
  OTHER = 'Other'
}

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  url?: string;
  
  @Prop({ enum: TeamSize, required: true })
  teamSize: string;
  
  @Prop({ required: true })
  ownerFullName: string;
  
  @Prop({ enum: UserRole, required: true })
  ownerRole: string;
  
  @Prop()
  ownerRoleCustom?: string;
  
  @Prop({ enum: Purpose, required: true })
  purpose: string;
  
  @Prop()
  purposeCustom?: string;
  
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  members: MongooseSchema.Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company); 