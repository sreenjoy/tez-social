import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pipeline, PipelineSchema } from '../common/schemas/pipeline.schema';
import { Stage, StageSchema } from '../common/schemas/stage.schema';
import { Deal, DealSchema } from '../common/schemas/deal.schema';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pipeline.name, schema: PipelineSchema },
      { name: Stage.name, schema: StageSchema },
      { name: Deal.name, schema: DealSchema },
    ]),
  ],
  controllers: [PipelinesController],
  providers: [PipelinesService],
  exports: [PipelinesService],
})
export class PipelinesModule {} 