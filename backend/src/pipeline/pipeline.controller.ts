import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Put, 
  Delete, 
  UseGuards, 
  Request, 
  Logger,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PipelineService } from './pipeline.service';
import { CreatePipelineDto, CreateStageDto } from './dto';

@Controller('pipeline')
export class PipelineController {
  private readonly logger = new Logger(PipelineController.name);

  constructor(private readonly pipelineService: PipelineService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPipeline(
    @Body() createPipelineDto: CreatePipelineDto,
    @Request() req
  ) {
    try {
      if (!req.user?.companyId) {
        throw new BadRequestException('User must be associated with a company');
      }
      
      return this.pipelineService.createPipeline(
        req.user.companyId,
        createPipelineDto
      );
    } catch (error) {
      this.logger.error(`Failed to create pipeline: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPipelines(@Request() req) {
    try {
      if (!req.user?.companyId) {
        throw new BadRequestException('User must be associated with a company');
      }
      
      return this.pipelineService.findPipelinesByCompany(req.user.companyId);
    } catch (error) {
      this.logger.error(`Failed to get pipelines: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('default')
  @UseGuards(JwtAuthGuard)
  async getDefaultPipeline(@Request() req) {
    try {
      if (!req.user?.companyId) {
        throw new BadRequestException('User must be associated with a company');
      }
      
      const pipeline = await this.pipelineService.findDefaultPipeline(req.user.companyId);
      if (!pipeline) {
        throw new NotFoundException('No default pipeline found');
      }
      
      return pipeline;
    } catch (error) {
      this.logger.error(`Failed to get default pipeline: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPipelineById(@Param('id') id: string) {
    return this.pipelineService.findPipelineById(id);
  }

  @Get(':id/stages')
  @UseGuards(JwtAuthGuard)
  async getPipelineStages(@Param('id') id: string) {
    return this.pipelineService.getStages(id);
  }

  @Post(':id/stages')
  @UseGuards(JwtAuthGuard)
  async createStage(
    @Param('id') pipelineId: string,
    @Body() createStageDto: CreateStageDto
  ) {
    return this.pipelineService.createStage(pipelineId, createStageDto);
  }

  @Put(':id/stages/reorder')
  @UseGuards(JwtAuthGuard)
  async reorderStages(
    @Param('id') pipelineId: string,
    @Body('order') stageOrder: string[]
  ) {
    if (!stageOrder || !Array.isArray(stageOrder)) {
      throw new BadRequestException('Order must be an array of stage IDs');
    }
    
    return this.pipelineService.reorderStages(pipelineId, stageOrder);
  }
} 