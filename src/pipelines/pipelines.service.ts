import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pipeline, PipelineDocument } from '../common/schemas/pipeline.schema';
import { Stage, StageDocument } from '../common/schemas/stage.schema';
import { Deal, DealDocument } from '../common/schemas/deal.schema';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class PipelinesService {
  private readonly logger = new Logger(PipelinesService.name);

  constructor(
    @InjectModel(Pipeline.name) private pipelineModel: Model<PipelineDocument>,
    @InjectModel(Stage.name) private stageModel: Model<StageDocument>,
    @InjectModel(Deal.name) private dealModel: Model<DealDocument>,
  ) {}

  // Pipeline Methods
  async createPipeline(createPipelineDto: CreatePipelineDto, userId: string): Promise<Pipeline> {
    try {
      const newPipeline = new this.pipelineModel({
        ...createPipelineDto,
        createdBy: userId,
      });
      return await newPipeline.save();
    } catch (error) {
      this.logger.error(`Failed to create pipeline: ${error.message}`);
      throw new BadRequestException('Failed to create pipeline');
    }
  }

  async findAllPipelines(userId: string): Promise<Pipeline[]> {
    try {
      return await this.pipelineModel.find({ createdBy: userId, isActive: true })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error(`Failed to find pipelines: ${error.message}`);
      throw new BadRequestException('Failed to fetch pipelines');
    }
  }

  async findPipelineById(id: string, userId: string): Promise<Pipeline> {
    try {
      const pipeline = await this.pipelineModel.findOne({ 
        _id: id, 
        createdBy: userId,
        isActive: true 
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline with ID ${id} not found`);
      }
      
      return pipeline;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find pipeline: ${error.message}`);
      throw new BadRequestException('Failed to fetch pipeline');
    }
  }

  async updatePipeline(id: string, updatePipelineDto: UpdatePipelineDto, userId: string): Promise<Pipeline> {
    try {
      const pipeline = await this.pipelineModel.findOneAndUpdate(
        { _id: id, createdBy: userId },
        { $set: updatePipelineDto },
        { new: true }
      ).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline with ID ${id} not found`);
      }
      
      return pipeline;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update pipeline: ${error.message}`);
      throw new BadRequestException('Failed to update pipeline');
    }
  }

  async deletePipeline(id: string, userId: string): Promise<void> {
    try {
      // Soft delete the pipeline by setting isActive to false
      const result = await this.pipelineModel.updateOne(
        { _id: id, createdBy: userId },
        { $set: { isActive: false } }
      ).exec();
      
      if (result.modifiedCount === 0) {
        throw new NotFoundException(`Pipeline with ID ${id} not found`);
      }
      
      // Also soft delete related stages
      await this.stageModel.updateMany(
        { pipelineId: id },
        { $set: { isActive: false } }
      ).exec();
      
      // And soft delete related deals
      await this.dealModel.updateMany(
        { pipelineId: id },
        { $set: { isActive: false } }
      ).exec();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete pipeline: ${error.message}`);
      throw new BadRequestException('Failed to delete pipeline');
    }
  }

  // Stage Methods
  async createStage(createStageDto: CreateStageDto, userId: string): Promise<Stage> {
    try {
      // Verify the pipeline exists and belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: createStageDto.pipelineId,
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline with ID ${createStageDto.pipelineId} not found`);
      }
      
      // Get highest order if none provided
      if (!createStageDto.order) {
        const highestStage = await this.stageModel.findOne({
          pipelineId: createStageDto.pipelineId,
          isActive: true
        }).sort({ order: -1 }).exec();
        
        createStageDto.order = highestStage ? highestStage.order + 1 : 0;
      }
      
      const newStage = new this.stageModel({
        ...createStageDto,
        createdBy: userId,
        pipeline: pipeline._id, // Set the pipeline reference
      });
      
      const savedStage = await newStage.save();
      
      // Update pipeline to include this stage if not already there
      await this.pipelineModel.updateOne(
        { _id: createStageDto.pipelineId },
        { $addToSet: { stages: savedStage._id } }
      ).exec();
      
      return savedStage;
    } catch (error) {
      this.logger.error(`Failed to create stage: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create stage');
    }
  }

  async findStagesByPipelineId(pipelineId: string, userId: string): Promise<Stage[]> {
    try {
      // Verify the pipeline exists and belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: pipelineId,
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline with ID ${pipelineId} not found`);
      }
      
      // Get all active stages for this pipeline, ordered by their order field
      return await this.stageModel.find({
        pipelineId,
        isActive: true
      }).sort({ order: 1 }).exec();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find stages: ${error.message}`);
      throw new BadRequestException('Failed to fetch stages');
    }
  }

  async updateStage(id: string, updateStageDto: UpdateStageDto, userId: string): Promise<Stage | null> {
    try {
      // Find the stage first to verify pipeline ownership
      const stage = await this.stageModel.findOne({ _id: id, isActive: true }).exec();
      
      if (!stage) {
        throw new NotFoundException(`Stage with ID ${id} not found`);
      }
      
      // Verify the pipeline belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: stage.get('pipelineId'),
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline not found or access denied`);
      }
      
      // Update the stage
      const updatedStage = await this.stageModel.findByIdAndUpdate(
        id,
        { $set: updateStageDto },
        { new: true }
      ).exec();
      
      if (!updatedStage) {
        throw new NotFoundException(`Stage with ID ${id} not found after update`);
      }
      
      return updatedStage;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update stage: ${error.message}`);
      throw new BadRequestException('Failed to update stage');
    }
  }

  async deleteStage(id: string, userId: string): Promise<void> {
    try {
      // Find the stage first to verify pipeline ownership
      const stage = await this.stageModel.findOne({ _id: id, isActive: true }).exec();
      
      if (!stage) {
        throw new NotFoundException(`Stage with ID ${id} not found`);
      }
      
      // Verify the pipeline belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: stage.get('pipelineId'),
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline not found or access denied`);
      }
      
      // Soft delete the stage
      await this.stageModel.updateOne(
        { _id: id },
        { $set: { isActive: false } }
      ).exec();
      
      // Remove stage from pipeline's stages array
      await this.pipelineModel.updateOne(
        { _id: stage.get('pipelineId') },
        { $pull: { stages: new Types.ObjectId(id) } }
      ).exec();
      
      // Move deals to the first active stage or mark them as inactive if no stages left
      const activeStages = await this.stageModel.find({
        pipelineId: stage.get('pipelineId'),
        isActive: true
      }).sort({ order: 1 }).exec();
      
      if (activeStages.length > 0) {
        // Move deals to the first active stage
        await this.dealModel.updateMany(
          { stageId: id, isActive: true },
          { $set: { stageId: activeStages[0]._id } }
        ).exec();
      } else {
        // No active stages left, mark deals as inactive
        await this.dealModel.updateMany(
          { stageId: id },
          { $set: { isActive: false } }
        ).exec();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete stage: ${error.message}`);
      throw new BadRequestException('Failed to delete stage');
    }
  }

  // Deal Methods
  async createDeal(createDealDto: CreateDealDto, userId: string): Promise<Deal> {
    try {
      // Verify the pipeline exists and belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: createDealDto.pipelineId,
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline with ID ${createDealDto.pipelineId} not found`);
      }
      
      // Verify the stage exists and belongs to the pipeline
      const stage = await this.stageModel.findOne({
        _id: createDealDto.stageId,
        pipelineId: createDealDto.pipelineId,
        isActive: true
      }).exec();
      
      if (!stage) {
        throw new NotFoundException(`Stage with ID ${createDealDto.stageId} not found in this pipeline`);
      }
      
      const newDeal = new this.dealModel({
        ...createDealDto,
        createdBy: userId,
        pipeline: pipeline._id, // Set the pipeline reference
        stage: stage._id,       // Set the stage reference
      });
      
      return await newDeal.save();
    } catch (error) {
      this.logger.error(`Failed to create deal: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create deal');
    }
  }

  async findDealsByPipelineId(pipelineId: string, userId: string): Promise<Deal[]> {
    try {
      // Verify the pipeline exists and belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: pipelineId,
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline with ID ${pipelineId} not found`);
      }
      
      // Get all active deals for this pipeline
      return await this.dealModel.find({
        pipelineId,
        isActive: true
      }).sort({ updatedAt: -1 }).exec();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find deals: ${error.message}`);
      throw new BadRequestException('Failed to fetch deals');
    }
  }

  async findDealsByStageId(stageId: string, userId: string): Promise<Deal[]> {
    try {
      // Find the stage first to verify pipeline ownership
      const stage = await this.stageModel.findOne({ _id: stageId, isActive: true }).exec();
      
      if (!stage) {
        throw new NotFoundException(`Stage with ID ${stageId} not found`);
      }
      
      // Verify the pipeline belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: stage.get('pipelineId'),
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline not found or access denied`);
      }
      
      // Get all active deals for this stage
      return await this.dealModel.find({
        stageId,
        isActive: true
      }).sort({ updatedAt: -1 }).exec();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find deals: ${error.message}`);
      throw new BadRequestException('Failed to fetch deals');
    }
  }

  async findDealById(id: string, userId: string): Promise<Deal> {
    try {
      const deal = await this.dealModel.findOne({ _id: id, isActive: true }).exec();
      
      if (!deal) {
        throw new NotFoundException(`Deal with ID ${id} not found`);
      }
      
      // Verify the pipeline belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: deal.get('pipelineId'),
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline not found or access denied`);
      }
      
      return deal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to find deal: ${error.message}`);
      throw new BadRequestException('Failed to fetch deal');
    }
  }

  async updateDeal(id: string, updateDealDto: UpdateDealDto, userId: string): Promise<Deal | null> {
    try {
      const deal = await this.dealModel.findOne({ _id: id, isActive: true }).exec();
      
      if (!deal) {
        throw new NotFoundException(`Deal with ID ${id} not found`);
      }
      
      // Verify the pipeline belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: deal.get('pipelineId'),
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline not found or access denied`);
      }
      
      // If changing stage, verify it exists and belongs to the same pipeline
      if (updateDealDto.stageId) {
        const stage = await this.stageModel.findOne({
          _id: updateDealDto.stageId,
          pipelineId: deal.get('pipelineId'),
          isActive: true
        }).exec();
        
        if (!stage) {
          throw new NotFoundException(`Stage with ID ${updateDealDto.stageId} not found in this pipeline`);
        }
      }
      
      const updatedDeal = await this.dealModel.findByIdAndUpdate(
        id,
        { $set: updateDealDto },
        { new: true }
      ).exec();
      
      if (!updatedDeal) {
        throw new NotFoundException(`Deal with ID ${id} not found after update`);
      }
      
      return updatedDeal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update deal: ${error.message}`);
      throw new BadRequestException('Failed to update deal');
    }
  }

  async deleteDeal(id: string, userId: string): Promise<void> {
    try {
      const deal = await this.dealModel.findOne({ _id: id, isActive: true }).exec();
      
      if (!deal) {
        throw new NotFoundException(`Deal with ID ${id} not found`);
      }
      
      // Verify the pipeline belongs to the user
      const pipeline = await this.pipelineModel.findOne({
        _id: deal.get('pipelineId'),
        createdBy: userId,
        isActive: true
      }).exec();
      
      if (!pipeline) {
        throw new NotFoundException(`Pipeline not found or access denied`);
      }
      
      // Soft delete the deal
      await this.dealModel.updateOne(
        { _id: id },
        { $set: { isActive: false } }
      ).exec();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete deal: ${error.message}`);
      throw new BadRequestException('Failed to delete deal');
    }
  }
} 