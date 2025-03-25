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
  Query
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DealService } from './deal.service';

@Controller('deal')
export class DealController {
  private readonly logger = new Logger(DealController.name);

  constructor(private readonly dealService: DealService) {}

  @Get('by-stage/:stageId')
  @UseGuards(JwtAuthGuard)
  async getDealsByStage(@Param('stageId') stageId: string) {
    return this.dealService.findDealsByStage(stageId);
  }

  @Get('by-pipeline/:pipelineId')
  @UseGuards(JwtAuthGuard)
  async getDealsByPipeline(@Param('pipelineId') pipelineId: string) {
    return this.dealService.findDealsByPipeline(pipelineId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDealById(@Param('id') id: string) {
    return this.dealService.findDealById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createDeal(@Body() dealData: any, @Request() req) {
    try {
      if (!req.user?.companyId) {
        throw new BadRequestException('User must be associated with a company');
      }
      
      const deal = {
        ...dealData,
        companyId: req.user.companyId,
      };
      
      return this.dealService.createDeal(deal);
    } catch (error) {
      this.logger.error(`Failed to create deal: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateDeal(@Param('id') id: string, @Body() updateData: any) {
    return this.dealService.updateDeal(id, updateData);
  }

  @Put(':id/move')
  @UseGuards(JwtAuthGuard)
  async moveDealToStage(
    @Param('id') id: string,
    @Body('stageId') stageId: string
  ) {
    if (!stageId) {
      throw new BadRequestException('Stage ID is required');
    }
    
    return this.dealService.moveToStage(id, stageId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteDeal(@Param('id') id: string) {
    await this.dealService.deleteDeal(id);
    return { message: 'Deal deleted successfully' };
  }

  @Get('tags/company')
  @UseGuards(JwtAuthGuard)
  async getTagsByCompany(@Request() req) {
    try {
      if (!req.user?.companyId) {
        throw new BadRequestException('User must be associated with a company');
      }
      
      return this.dealService.findTagsByCompany(req.user.companyId);
    } catch (error) {
      this.logger.error(`Failed to get tags: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('tags')
  @UseGuards(JwtAuthGuard)
  async createTag(@Body() tagData: any, @Request() req) {
    try {
      if (!req.user?.companyId) {
        throw new BadRequestException('User must be associated with a company');
      }
      
      const tag = {
        ...tagData,
        companyId: req.user.companyId,
      };
      
      return this.dealService.createTag(tag);
    } catch (error) {
      this.logger.error(`Failed to create tag: ${error.message}`, error.stack);
      throw error;
    }
  }
} 