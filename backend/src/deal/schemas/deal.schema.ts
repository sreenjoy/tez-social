import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class Deal extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: SchemaTypes.ObjectId })
  companyId: string;

  @Prop({ required: true, type: SchemaTypes.ObjectId })
  pipelineId: string;
  
  @Prop({ required: true, type: SchemaTypes.ObjectId })
  stageId: string;
  
  @Prop({ type: Number, default: 0 })
  value: number;
  
  @Prop()
  contactName: string;
  
  @Prop()
  contactEmail: string;
  
  @Prop()
  contactPhone: string;
  
  @Prop()
  description: string;
  
  @Prop({ type: [String], default: [] })
  tags: string[];
  
  @Prop({ type: Date })
  closingDate: Date;
  
  @Prop({ type: Boolean, default: true })
  isActive: boolean;
  
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  ownerId: string;
}

export const DealSchema = SchemaFactory.createForClass(Deal); 