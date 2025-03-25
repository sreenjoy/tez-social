import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Pipeline extends Document {
  @Prop({ required: true })
  name: string;
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  companyId: MongooseSchema.Types.ObjectId;
  
  @Prop({ default: false })
  isDefault: boolean;
  
  @Prop({ default: true })
  isActive: boolean;
  
  @Prop()
  description?: string;
}

export const PipelineSchema = SchemaFactory.createForClass(Pipeline); 