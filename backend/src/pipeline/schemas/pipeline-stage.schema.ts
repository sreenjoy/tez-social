import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class PipelineStage extends Document {
  @Prop({ required: true })
  name: string;
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Pipeline', required: true })
  pipelineId: MongooseSchema.Types.ObjectId;
  
  @Prop({ required: true })
  order: number;
  
  @Prop()
  color?: string;
  
  @Prop({ default: true })
  isActive: boolean;
}

export const PipelineStageSchema = SchemaFactory.createForClass(PipelineStage); 