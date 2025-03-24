import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Stage } from './stage.schema';
import { User } from './user.schema';
import { Pipeline } from './pipeline.schema';

export type DealDocument = Deal & Document;

@Schema({ timestamps: true })
export class Deal {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Stage' })
  stage: Stage;

  @Prop({ type: String, required: true })
  stageId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Pipeline' })
  pipeline: Pipeline;

  @Prop({ type: String, required: true })
  pipelineId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedTo?: User;

  @Prop({ required: false })
  telegramChatId?: string;

  @Prop({ type: Object })
  telegramChatInfo?: Record<string, any>;

  @Prop({ type: Object })
  contactInfo?: Record<string, any>;

  @Prop({ type: Number })
  value?: number;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, enum: ['new', 'in_progress', 'won', 'lost'], default: 'new' })
  status: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  customFields?: Record<string, any>;
}

export const DealSchema = SchemaFactory.createForClass(Deal); 