import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class Tag extends Document {
  @Prop({ required: true })
  name: string;
  
  @Prop({ type: String, default: '#3498db' })
  color: string;
  
  @Prop({ required: true, type: SchemaTypes.ObjectId })
  companyId: string;
  
  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const TagSchema = SchemaFactory.createForClass(Tag); 