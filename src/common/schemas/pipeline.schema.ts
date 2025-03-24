import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Stage } from './stage.schema';

export type PipelineDocument = Pipeline & Document;

@Schema({ timestamps: true })
export class Pipeline {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Stage' }], default: [] })
  stages: Stage[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  settings?: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  order: number;
}

export const PipelineSchema = SchemaFactory.createForClass(Pipeline); 