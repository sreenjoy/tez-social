import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Pipeline } from './pipeline.schema';
import { User } from './user.schema';

export type StageDocument = Stage & Document;

@Schema({ timestamps: true })
export class Stage {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Pipeline' })
  pipeline: Pipeline;

  @Prop({ type: String, required: true })
  pipelineId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  settings?: Record<string, any>;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: String, enum: ['new', 'in_progress', 'completed', 'archived'], default: 'new' })
  status: string;
}

export const StageSchema = SchemaFactory.createForClass(Stage); 