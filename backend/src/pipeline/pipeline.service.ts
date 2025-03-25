import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pipeline } from './schemas/pipeline.schema';
import { PipelineStage } from './schemas/pipeline-stage.schema';
import { CreatePipelineDto, CreateStageDto } from './dto';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    @InjectModel(Pipeline.name) private pipelineModel: Model<Pipeline>,
    @InjectModel(PipelineStage.name) private stageModel: Model<PipelineStage>,
  ) {}

  async createPipeline(companyId: string, createPipelineDto: CreatePipelineDto): Promise<Pipeline> {
    try {
      this.logger.log(`Creating pipeline with data: ${JSON.stringify(createPipelineDto)}`);
      
      // Check if this is the first pipeline and make it default if so
      const existingPipelines = await this.pipelineModel.countDocuments({ companyId });
      const pipeline = new this.pipelineModel({
        ...createPipelineDto,
        companyId,
        isDefault: existingPipelines === 0,
      });
      
      const savedPipeline = await pipeline.save();
      
      // Create default stages for the pipeline
      await this.createDefaultStages(savedPipeline._id as Types.ObjectId);
      
      return this.findPipelineById((savedPipeline._id as Types.ObjectId).toString());
    } catch (error) {
      this.logger.error(`Failed to create pipeline: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create pipeline');
    }
  }

  private async createDefaultStages(pipelineId: Types.ObjectId): Promise<void> {
    try {
      const defaultStages = [
        { name: 'Lead', order: 0, color: '#6C7A89' },
        { name: 'Contact Made', order: 1, color: '#4183D7' },
        { name: 'Proposal', order: 2, color: '#26A65B' },
        { name: 'Negotiation', order: 3, color: '#F4D03F' },
        { name: 'Closed Won', order: 4, color: '#26C281' },
        { name: 'Closed Lost', order: 5, color: '#D91E18' },
      ];
      
      const stageDocuments = defaultStages.map(stage => ({
        ...stage,
        pipelineId,
      }));
      
      await this.stageModel.insertMany(stageDocuments);
    } catch (error) {
      this.logger.error(`Failed to create default stages: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findPipelinesByCompany(companyId: string): Promise<Pipeline[]> {
    try {
      return this.pipelineModel.find({ companyId, isActive: true }).exec();
    } catch (error) {
      this.logger.error(`Failed to find pipelines for company ${companyId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findDefaultPipeline(companyId: string): Promise<Pipeline | null> {
    try {
      return this.pipelineModel.findOne({ companyId, isDefault: true, isActive: true }).exec();
    } catch (error) {
      this.logger.error(`Failed to find default pipeline for company ${companyId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findPipelineById(id: string | Types.ObjectId): Promise<Pipeline> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid pipeline ID');
      }
      
      const pipeline = await this.pipelineModel.findById(id).exec();
      
      if (!pipeline || !pipeline.isActive) {
        throw new NotFoundException('Pipeline not found');
      }
      
      return pipeline;
    } catch (error) {
      this.logger.error(`Failed to find pipeline by ID ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStages(pipelineId: string): Promise<PipelineStage[]> {
    try {
      if (!Types.ObjectId.isValid(pipelineId)) {
        throw new NotFoundException('Invalid pipeline ID');
      }
      
      const stages = await this.stageModel.find({ 
        pipelineId,
        isActive: true 
      }).sort({ order: 1 }).exec();
      
      return stages;
    } catch (error) {
      this.logger.error(`Failed to get stages for pipeline ${pipelineId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createStage(pipelineId: string, createStageDto: CreateStageDto): Promise<PipelineStage> {
    try {
      if (!Types.ObjectId.isValid(pipelineId)) {
        throw new BadRequestException('Invalid pipeline ID');
      }
      
      // Check if pipeline exists
      const pipeline = await this.pipelineModel.findById(pipelineId);
      if (!pipeline || !pipeline.isActive) {
        throw new NotFoundException('Pipeline not found');
      }
      
      // Create the stage
      const stage = new this.stageModel({
        ...createStageDto,
        pipelineId,
      });
      
      return stage.save();
    } catch (error) {
      this.logger.error(`Failed to create stage: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateStage(stageId: string, updateData: Partial<PipelineStage>): Promise<PipelineStage> {
    try {
      if (!Types.ObjectId.isValid(stageId)) {
        throw new BadRequestException('Invalid stage ID');
      }
      
      const stage = await this.stageModel.findByIdAndUpdate(
        stageId,
        updateData,
        { new: true }
      );
      
      if (!stage) {
        throw new NotFoundException('Stage not found');
      }
      
      return stage;
    } catch (error) {
      this.logger.error(`Failed to update stage ${stageId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async reorderStages(pipelineId: string, stageOrder: string[]): Promise<PipelineStage[]> {
    try {
      if (!Types.ObjectId.isValid(pipelineId)) {
        throw new BadRequestException('Invalid pipeline ID');
      }
      
      // Check if all stageIds are valid and belong to the pipeline
      const validIds = stageOrder.every(id => Types.ObjectId.isValid(id));
      if (!validIds) {
        throw new BadRequestException('Invalid stage IDs in order array');
      }
      
      // Update order for each stage
      const updatePromises = stageOrder.map((stageId, index) => {
        return this.stageModel.findOneAndUpdate(
          { _id: stageId, pipelineId },
          { order: index },
          { new: true }
        );
      });
      
      const updatedStages = await Promise.all(updatePromises);
      
      // Check if any stages were not found
      if (updatedStages.includes(null)) {
        throw new BadRequestException('One or more stages not found or do not belong to this pipeline');
      }
      
      return this.getStages(pipelineId);
    } catch (error) {
      this.logger.error(`Failed to reorder stages: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteStage(stageId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(stageId)) {
        throw new BadRequestException('Invalid stage ID');
      }
      
      const stage = await this.stageModel.findById(stageId);
      if (!stage) {
        throw new NotFoundException('Stage not found');
      }
      
      // Instead of actually deleting, mark as inactive
      stage.isActive = false;
      await stage.save();
    } catch (error) {
      this.logger.error(`Failed to delete stage ${stageId}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 