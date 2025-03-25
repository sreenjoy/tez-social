import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { Pipeline, PipelineSchema } from './schemas/pipeline.schema';
import { PipelineStage, PipelineStageSchema } from './schemas/pipeline-stage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pipeline.name, schema: PipelineSchema },
      { name: PipelineStage.name, schema: PipelineStageSchema },
    ]),
  ],
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {} 