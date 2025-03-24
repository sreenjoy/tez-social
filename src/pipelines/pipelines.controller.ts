import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  // Pipeline Endpoints
  @Post()
  async createPipeline(@Body() createPipelineDto: CreatePipelineDto, @Request() req) {
    return this.pipelinesService.createPipeline(createPipelineDto, req.user._id);
  }

  @Get()
  async findAllPipelines(@Request() req) {
    return this.pipelinesService.findAllPipelines(req.user._id);
  }

  @Get(':id')
  async findPipelineById(@Param('id') id: string, @Request() req) {
    return this.pipelinesService.findPipelineById(id, req.user._id);
  }

  @Put(':id')
  async updatePipeline(
    @Param('id') id: string, 
    @Body() updatePipelineDto: UpdatePipelineDto, 
    @Request() req
  ) {
    return this.pipelinesService.updatePipeline(id, updatePipelineDto, req.user._id);
  }

  @Delete(':id')
  async deletePipeline(@Param('id') id: string, @Request() req) {
    return this.pipelinesService.deletePipeline(id, req.user._id);
  }

  // Stage Endpoints
  @Post('stages')
  async createStage(@Body() createStageDto: CreateStageDto, @Request() req) {
    return this.pipelinesService.createStage(createStageDto, req.user._id);
  }

  @Get(':pipelineId/stages')
  async findStagesByPipelineId(@Param('pipelineId') pipelineId: string, @Request() req) {
    return this.pipelinesService.findStagesByPipelineId(pipelineId, req.user._id);
  }

  @Put('stages/:id')
  async updateStage(
    @Param('id') id: string, 
    @Body() updateStageDto: UpdateStageDto, 
    @Request() req
  ) {
    return this.pipelinesService.updateStage(id, updateStageDto, req.user._id);
  }

  @Delete('stages/:id')
  async deleteStage(@Param('id') id: string, @Request() req) {
    return this.pipelinesService.deleteStage(id, req.user._id);
  }

  // Deal Endpoints
  @Post('deals')
  async createDeal(@Body() createDealDto: CreateDealDto, @Request() req) {
    return this.pipelinesService.createDeal(createDealDto, req.user._id);
  }

  @Get(':pipelineId/deals')
  async findDealsByPipelineId(@Param('pipelineId') pipelineId: string, @Request() req) {
    return this.pipelinesService.findDealsByPipelineId(pipelineId, req.user._id);
  }

  @Get('stages/:stageId/deals')
  async findDealsByStageId(@Param('stageId') stageId: string, @Request() req) {
    return this.pipelinesService.findDealsByStageId(stageId, req.user._id);
  }

  @Get('deals/:id')
  async findDealById(@Param('id') id: string, @Request() req) {
    return this.pipelinesService.findDealById(id, req.user._id);
  }

  @Put('deals/:id')
  async updateDeal(
    @Param('id') id: string, 
    @Body() updateDealDto: UpdateDealDto, 
    @Request() req
  ) {
    return this.pipelinesService.updateDeal(id, updateDealDto, req.user._id);
  }

  @Delete('deals/:id')
  async deleteDeal(@Param('id') id: string, @Request() req) {
    return this.pipelinesService.deleteDeal(id, req.user._id);
  }
} 